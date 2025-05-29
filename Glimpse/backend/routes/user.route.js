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
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Get details of the currently authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The user's unique ID
 *                 email:
 *                   type: string
 *                   description: The user's email address
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date the user was created
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: The date the user was last updated
 *       401:
 *         description: Unauthorized - Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
router.get("/", getUser);

module.exports = router;
