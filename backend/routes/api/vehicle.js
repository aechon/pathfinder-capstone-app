const express = require('express')
const { check } = require('express-validator');

const { requireAuth, checkAuth } = require('../../utils/auth');
const { Vehicle } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validators
const validateVehicle = [
  requireAuth,
  check('name')
    .exists()
    .isString()
    .withMessage('Invalid vehicle name'),
  check('type')
    .exists()
    .isString()
    .withMessage('Invalid vehicle type'),
  check('mpg')
    .optional()
    .isInt({min: 1})
    .withMessage('Miles per gallon must be a positive integer'),
  check('tankSize')
    .optional()
    .isInt({min: 1})
    .withMessage('Tank capacity must be a positive integer'),
  check('range')
    .optional()
    .isInt({min: 1})
    .withMessage('Range must be a positive integer'),
  handleValidationErrors
];

// New Vehicle
router.post(
  '/new',
  validateVehicle,
  async (req, res) => {
    const {
        name, 
        type,
        mpg,
        tankSize,
        range,
    } = req.body;

    let vehicle;
    if (type === 'electric' || type === 'gas') {
      if (type === 'electric') {
        if (!range) res.status(400).json({
            message: "Missing range."
        });
        else {
          vehicle = await Vehicle.create({
            name: name,
            type: type,
            range: range,
            userId: req.user.id,
          });
        }
      };
      if (type === 'gas') {
        if (!mpg || !tankSize) res.status(400).json({
            message: "Missing miles per gallon or tank capacity."
        });
        else {
          vehicle = await Vehicle.create({
            name: name,
            type: type,
            mpg: mpg,
            tankSize: tankSize,
            userId: req.user.id,
          });
        }
      }
    } else res.status(400).json({
        message: "Invalid vehicle type."
    });

    return res.status(201).json(vehicle);
  });

// Get all user's vehicles
router.get(
  '/session',
  requireAuth,
  async (req, res) => {

    const vehicles = await Vehicle.findAll({
      where: {
        userId: req.user.id
      },
      order: [
        ['createdAt', 'ASC']
      ]
    });

    return res.status(200).json(vehicles);
  });

// Delete a vehicle
router.delete(
  `/:vehicleId`,
  requireAuth,
  async (req, res) => {
    const vehicleId = req.path.split('/')[1];

    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId
      }
    });

    if (!vehicle) return res.status(404).json({ message: "Vehicle to delete couldn't be found"});

    const err = checkAuth(req, vehicle.userId);
    if (err) return res.status(403).json(err);

    await vehicle.destroy();

    return res.status(200).json('Vehicle deleted');
  });

// Edit a Vehicle
router.put(
  '/:vehicleId',
  validateVehicle,
  async (req, res) => {
    const vehicleId = req.path.split('/')[1];
    
    const vehicle = await Vehicle.findOne({
      where: {
        id: vehicleId
      }
    });

    if (!vehicle) return res.status(404).json({ message: "Vehicle to edit couldn't be found"});
    
    const err = checkAuth(req, vehicle.userId);
    if (err) return res.status(403).json(err);

    const {
      name, 
      type,
      mpg,
      tankSize,
      range,
    } = req.body;
  
    vehicle.name = name;
    vehicle.type = type;

    if (type === 'electric' || type === 'gas') {
      if (type === 'electric') {
        if (!range) res.status(400).json({
            message: "Missing range."
        });
        else {
          vehicle.range = range;
          vehicle.mpg = null;
          vehicle.tankSize = null;
        }
      };
      if (type === 'gas') {
        if (!mpg || !tankSize) res.status(400).json({
            message: "Missing miles per gallon or tank capacity."
        });
        else {
          vehicle.mpg = mpg;
          vehicle.tankSize = tankSize;
          vehicle.range = null;
        }
      }
    } else res.status(400).json({
        message: "Invalid vehicle type provided."
    });

    await vehicle.save();
  
    return res.status(201).json(vehicle);
  });

module.exports = router;