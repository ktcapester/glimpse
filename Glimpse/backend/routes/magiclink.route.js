const express = require("express");
const {
  postMagicLink,
  postLoginTokens,
  postRefreshToken,
  postLogout,
} = require("../controllers/magiclink.controller");

const router = express.Router();

/**
 * POST request to send a magic link to the user's email.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/auth/magic-link:
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
 * POST request to verify the magic link token.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify magic link token and return access and refresh tokens
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
router.post("/verify", postLoginTokens);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using the refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 */
router.post("/refresh-token", postRefreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout and invalidate the refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out
 */
router.post("/logout", postLogout);

module.exports = router;
