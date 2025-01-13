const express = require('express')

const { requireAuth } = require('../../utils/auth');
const { Waypoint } = require('../../db/models');
const router = express.Router();

// Waypoint interval in seconds
const WAYPOINT_INTERVAL = 300;

// Get waypoint based on time and trip
router.get(
  `/`,
  requireAuth,
  async (req, res) => {
    const { 
        tripId,
        time } = req.body;

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

module.exports = router;