const express = require('express')
const { check } = require('express-validator');

const { requireAuth, checkAuth } = require('../../utils/auth');
const { Tag } = require('../../db/models');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// Validators
const validateTag = [
  requireAuth,
  check('tag')
    .exists()
    .isString()
    .withMessage('Invalid tag'),
  check('type')
    .exists()
    .isString()
    .withMessage('Invalid tag type'),
  handleValidationErrors
];

// New Tag
router.post(
  '/new',
  validateTag,
  async (req, res) => {
    const {
        tag, 
        type
    } = req.body;

    const duplicate = await Tag.findOne({
      where: {
        userId: req.user.id,
        tag: tag
      }
    });

    if (duplicate) return res.status(400).json({ message: "Tag already exists"});

    const newTag = await Tag.create({
        tag: tag,
        type: type,
        userId: req.user.id,
    });

    return res.status(201).json(newTag);
  });

// Get all user's tags
router.get(
  '/session',
  requireAuth,
  async (req, res) => {

    const tags = await Tag.findAll({
      where: {
        userId: req.user.id
      },
      order: [
        ['tag', 'ASC']
      ]
    });

    return res.status(200).json(tags);
  });

// Delete a tag
router.delete(
  `/:tagId`,
  requireAuth,
  async (req, res) => {
    const tagId = req.path.split('/')[1];

    const tag = await Tag.findOne({
      where: {
        id: tagId
      }
    });

    if (!tag) return res.status(404).json({ message: "Trip to delete couldn't be found"});

    const err = checkAuth(req, tag.userId);
    if (err) return res.status(403).json(err);

    await tag.destroy();

    return res.status(200).json('Tag deleted');
  });

module.exports = router;