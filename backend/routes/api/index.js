const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
// Import routers
const sessionRouter = require('./session.js');
const usersRouter = require('./users.js');
const tripRouter = require('./trip.js');
const detourRouter = require('./detour.js')
const tagRouter = require('./tag.js');
const vehicleRouter = require('./vehicle.js');


// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

// Implement routers
router.use('/session', sessionRouter);
router.use('/users', usersRouter);
router.use('/trips', tripRouter);
router.use('/detours', detourRouter);
router.use('/tags', tagRouter);
router.use('/vehicles', vehicleRouter);

module.exports = router;