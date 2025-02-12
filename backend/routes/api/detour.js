const OpenAI = require("openai");
const { zodResponseFormat } = require("openai/helpers/zod");
const z = require("zod");
const express = require('express')
const { check } = require('express-validator');

const { requireAuth, checkAuth } = require('../../utils/auth');
const { Trip, Waypoint, Detour, Tag } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');
const OPEN_AI_API_KEY = process.env.OPEN_AI_API_KEY

const router = express.Router();

// Waypoint interval in seconds
const WAYPOINT_INTERVAL = 300;

// Validators
const validateDetour = [
  requireAuth, 
  check('lat')
    .exists()
    .isFloat({ min: -90, max: 90})
    .withMessage('Latitude is invalid'),
  check('lng')
    .exists()
    .isFloat({ min: -180, max: 180})
    .withMessage('Longitude is invalid'),
  check('type')
    .exists()
    .isString()
    .withMessage('Invalid type'),
  check('name')
    .exists()
    .isString()
    .withMessage('Invalid name'),
  check('tripId')
    .exists()
    .isInt()
    .withMessage('Invalid trip ID'),
  handleValidationErrors
];

// New Detour
router.post(
  '/new',
  validateDetour,
  async (req, res) => {
    const { 
        tripId,
        lat, 
        lng, 
        name, 
        type,
        duration,
        distance,
        steps
      } = req.body;

    const trip = await Trip.findOne({
      where: {
          id: tripId
      }
    });

    if (!trip) return res.status(404).json({
        message: "Trip to add detour to couldn't be found"
    });

    const err = checkAuth(req, trip.userId);
    if (err) return res.status(403).json(err);

    // Create detour
    await Detour.create({
        tripId: tripId,
        name: name,
        type: type,
        lat: lat,
        lng: lng,
      });

    // Update distance and duration
    trip.duration = duration;
    trip.distance = distance;
    await trip.save();

    // Get updated trip
    const newTrip = await Trip.findOne({
        where: {
          id: tripId
        },
        include: {
          model: Detour
        }
      });

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

    return res.status(201).json(newTrip);
  });

// Delete Detour
router.delete(
  '/delete',
  requireAuth,
  async (req, res) => {
    const { 
        tripId,
        detourId,
        duration,
        distance,
        steps
      } = req.body;
  
    const trip = await Trip.findOne({
      where: {
        id: tripId
      }
    });
  
    if (!trip) return res.status(404).json({
        message: "Trip to delete detour from couldn't be found"
    });
  
    const err = checkAuth(req, trip.userId);
    if (err) return res.status(403).json(err);

    const detour = await Detour.findOne({
        where: {
          id: detourId
        }
    });
    await detour.destroy();
  
    // Update distance and duration
    trip.duration = duration;
    trip.distance = distance;
    await trip.save();
  
    // Get updated trip
    const newTrip = await Trip.findOne({
        where: {
          id: tripId
        },
        include: {
          model: Detour
        }
      });
  
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
  
    return res.status(200).json(newTrip);
  });

// Find the detour the best fits the user's preferences with AI
router.post(
  '/quick',
  // validateDetour,
  async (req, res) => {

  const detourOptions = req.body;

  const likes = await Tag.findAll({
    where: {
      userId: req.user.id,
      type: 'like',
    },
    raw: true
  });

  const dislikes = await Tag.findAll({
    where: {
      userId: req.user.id,
      type: 'dislike',
    },
    raw: true
  });

  // GPT Query
  // console.log(`I have these options as stops:\n
  //   ${detourOptions.map(detour => {
  //     return `${index}. ${detour.name} ${detour.types} Price Level: ${detour.price_level} Rating: ${detour.user_rating} with ${detour.total_user_ratings} total ratings.`
  //   }).join("\n")}\n
  //   ${(likes.length > 0 ? `I like${likes.map(like => ' ' + like.tag)}\n` : '')}
  //   ${(dislikes.length > 0 ? `I dislike${dislikes.map(dislike => ' ' + dislike.tag)}\n` : '')}
  //   Pick the best stop for me.
  // `)

  const openai = new OpenAI({
      apiKey: OPEN_AI_API_KEY,
  });

  const SelectedDetour = z.object({
    name: z.string(),
    index: z.number(),
  });

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {"role": "system", content: "Pick the best option from the given list based on the preferences."},
      {"role": "user", content: `I have these options as stops:\n${
        detourOptions.map((detour, index) => {
          return `${index}. ${detour.name} ${detour.types} Price Level: ${detour.price_level} Rating: ${detour.user_rating} with ${detour.total_user_ratings} total ratings.`
        }).join("\n")}\n${(likes.length > 0 ? `I like${likes.map(like => ' ' + like.tag)}\n` : '')}${(dislikes.length > 0 ? `I dislike${dislikes.map(dislike => ' ' + dislike.tag)}\n` : '')}Pick the best stop for me.`},
    ],
    response_format: zodResponseFormat(SelectedDetour, "detour"),
  });

  const detour = completion.choices[0].message.parsed;

    return res.status(200).json(detour);
});

module.exports = router;