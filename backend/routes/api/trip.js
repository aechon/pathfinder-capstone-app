const express = require('express')
const { check } = require('express-validator');

const { requireAuth } = require('../../utils/auth');
const { Trip, Waypoint } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Waypoint interval in seconds
const WAYPOINT_INTERVAL = 300;

// Validators
const validateTrip = [
  requireAuth, 
  check('startLat')
    .exists()
    .isFloat({ min: -90, max: 90})
    .withMessage('Start latitude is invalid'),
  check('startLng')
    .exists()
    .isFloat({ min: -180, max: 180})
    .withMessage('Start longitude is invalid'),
  check('endLat')
    .exists()
    .isFloat({ min: -90, max: 90})
    .withMessage('Destination latitude is invalid'),
  check('endLng')
    .exists()
    .isFloat({ min: -180, max: 180})
    .withMessage('Destination longitude is invalid'),
  check('duration')
    .exists()
    .isInt()
    .withMessage('Invalid duration'),
  check('distance')
    .exists()
    .isString()
    .withMessage('Invalid distance'),
  check('startAddress')
    .exists()
    .isString()
    .withMessage('Invalid starting address'),
  check('endAddress')
    .exists()
    .isString()
    .withMessage('Invalid destination address'),
  check('steps')
    .exists()
    .isArray()
    .withMessage('Invalid steps array'),
  handleValidationErrors
];

// New Trip
router.post(
  '/new',
  validateTrip,
  async (req, res) => {
    const { 
        startAddress,
        startLat, 
        startLng, 
        endAddress, 
        endLat, 
        endLng, 
        duration, 
        distance, 
        steps } = req.body;

    const trip = await Trip.create({
        startAddress: startAddress,
        startLat: startLat,
        startLng: startLng,
        endAddress: endAddress,
        endLat: endLat,
        endLng: endLng,
        duration: duration,
        distance: distance,
        userId: req.user.id,
    });

    let timeElapsed = 0;
    let intervalCount = 0;
    let i = 0;
    let waypointsData = [];
    while ( i < steps.length) {
        if (steps[i].duration + intervalCount < WAYPOINT_INTERVAL) {
            intervalCount += steps[i].duration;
            i++;
        } else {
            if (steps[i].duration < WAYPOINT_INTERVAL) {
                intervalCount = (steps[i].duration + intervalCount) % WAYPOINT_INTERVAL;
                timeElapsed += WAYPOINT_INTERVAL;
                waypointsData.push({tripId: trip.id, time: timeElapsed + intervalCount, lat: steps[i].endLat, lng: steps[i].endLng});
                i++;
            } else {
                let j = 0;
                let subSteps = Math.floor(steps[i].duration / WAYPOINT_INTERVAL);
                while (j < subSteps) {
                    timeElapsed += WAYPOINT_INTERVAL;
                    waypointsData.push({tripId: trip.id, time: timeElapsed + intervalCount, lat: steps[i].lat_lngs[j].lat, lng: steps[i].lat_lngs[j].lng});
                    j++;
                }
                steps[i].duration = steps[i].duration % WAYPOINT_INTERVAL;
            }
        }
    }

    // Attempt to create waypoints but delete trip if an error occurs
    await Waypoint.bulkCreate(waypointsData)
        .catch(() => {
            Trip.destroy({
                where: {
                    id: trip.id
                }
            })
        })

    return res.status(201).json(trip);
  });

module.exports = router;