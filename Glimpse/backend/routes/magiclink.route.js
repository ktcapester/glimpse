const express = require("express");
const {
  postMagicLink,
  getMagicToken,
} = require("../controllers/magiclink.controller");

const router = express.Router();

/**
 * POST request to send a magic link to the user's email.
 * @route POST /api/magic-link
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post("/magic-link", postMagicLink);

/**
 * GET request to verify the magic link token.
 * @route GET /api/magiclink/verify
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/verify", getMagicToken);

module.exports = router;
