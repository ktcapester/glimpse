const express = require("express");
const { getPrices } = require("../controllers/price.controller");
const router = express.Router();

/**
 * GET request to fetch card prices by name.
 * @route GET /api/prices
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/", getPrices);

module.exports = router;
