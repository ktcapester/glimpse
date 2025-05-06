const express = require("express");
const authenticateJWT = require("../middleware/authJWT.middle");
const { getUser } = require("../controllers/user.controller");

const router = express.Router();

/**
 * Middleware to authenticate all routes in this router using JWT.
 */
router.use(authenticateJWT);

/**
 * GET request to fetch user details.
 * @route GET /api/user
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get("/", getUser);

module.exports = router;
