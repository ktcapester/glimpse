const express = require("express");
const {
  postMagicLink,
  getMagicToken,
} = require("../controllers/magiclink.controller");

const router = express.Router();

/**
 * POST request to send a magic link to the user's email.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/magic-link:
 *   post:
 *     summary: Send a magic login link to the provided email address
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Magic link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Magic link sent successfully.
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Email is required
 *       500:
 *         description: Server error
 */
router.post("/magic-link", postMagicLink);

/**
 * GET request to verify the magic link token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/magiclink/verify:
 *   get:
 *     summary: Verify magic link token and return a JWT
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The magic link token to verify
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email address associated with the token
 *     responses:
 *       200:
 *         description: Login successful, JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *       400:
 *         description: Invalid or expired token, or missing parameters
 *       500:
 *         description: Server error
 */
router.get("/verify", getMagicToken);

module.exports = router;
