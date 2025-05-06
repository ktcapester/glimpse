const express = require("express");
const { getCardSearch } = require("../controllers/search.controller");
const router = express.Router();

/**
 * GET request to search for cards by name.
 * @route GET /api/search
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/", getCardSearch);

module.exports = router;
