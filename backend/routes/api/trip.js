const express = require('express')
const { check } = require('express-validator');

const { requireAuth, checkAuth } = require('../../utils/auth');
const { Trip, Waypoint, Detour } = require('../../db/models');
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
          trip.destroy()
      })

    return res.status(201).json(trip);
  });

// Get waypoint based on time and trip
router.get(
  `/:tripId/waypoint/:time`,
  requireAuth,
  async (req, res) => {
    const tripId = req.path.split('/')[1];
    const time = req.path.split('/')[3];

    const waypoints = await Waypoint.findAll({
        where: {
            tripId: tripId
        },
        order: [
            ['time', 'ASC']
        ]
    });

    if (waypoints.length === 0) return res.status(404).json({
        message: "No waypoints found for trip"
    });

    const waypoint = waypoints.find((waypoint) => {
        return waypoint.time + WAYPOINT_INTERVAL >= time;
    })

    if (!waypoint) return res.status(404).json({
        message: "Time exceeds trip time"
    });

    return res.status(200).json(waypoint);
  });

// Get all trips
router.get(
  '/session',
  requireAuth,
  async (req, res) => {

    const trips = await Trip.findAll({
        where: {
            userId: req.user.id
        },
        include: {
            model: Detour
        }
    });

    if (!trips) return res.status(404).json({
        message: "Trips couldn't be found"
    });

    return res.status(200).json(trips);
  });

// Get trip details
router.get(
  `/:tripId`,
  requireAuth,
  async (req, res) => {
    const tripId = req.path.split('/')[1];

    const trip = await Trip.findOne({
        where: {
            id: tripId
        },
        include: {
            model: Detour
        }
    });

    if (!trip) return res.status(404).json({
        message: "Trip couldn't be found"
    });

    const err = checkAuth(req, trip.userId);
    if (err) return res.status(403).json(err);

    return res.status(200).json(trip);
  });

// Edit trip
router.put(
  `/:tripId`,
  requireAuth,
  async (req, res) => {
    const tripId = req.path.split('/')[1];
    const { 
        startAddress,
        startLat, 
        startLng, 
        endAddress, 
        endLat, 
        endLng, 
        duration, 
        distance, 
        steps
      } = req.body;
  
    const trip = await Trip.findOne({
      where: {
        id: tripId
      },
      include: {
        model: Detour
      }
    });
  
    if (!trip) return res.status(404).json({
        message: "Trip to edit couldn't be found"
    });
  
    const err = checkAuth(req, trip.userId);
    if (err) return res.status(403).json(err);
  
    // Update trip data
    trip.startAddress = startAddress;
    trip.startLat = startLat;
    trip.startLng = startLng;
    trip.endAddress = endAddress;
    trip.endLat = endLat;
    trip.endLng = endLng;
    trip.duration = duration;
    trip.distance = distance;
    await trip.save();
  
    // Delete previous waypoints
    await Waypoint.destroy({
        where: {
          tripId: tripId
        }
      });

    // Generate waypoints for new trip with detour
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
  
    // Attempt to create new waypoints
    await Waypoint.bulkCreate(waypointsData);
  
    return res.status(201).json(trip);
  });

// Delete trip
router.delete(
  `/:tripId`,
  requireAuth,
  async (req, res) => {
    const tripId = req.path.split('/')[1];
    
    const trip = await Trip.findOne({
      where: {
        id: tripId
      }
    });
  
    if (!trip) return res.status(204).json({
        message: "Trip to delete couldn't be found"
    });
  
    const err = checkAuth(req, trip.userId);
    if (err) return res.status(403).json(err);
  
    // Delete trip
    await trip.destroy();
  
    return res.status(200).json('Trip deleted');
  });

module.exports = router;