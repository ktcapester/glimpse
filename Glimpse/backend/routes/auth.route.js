const express = require("express");
const {
  postRefreshToken,
  postLogout,
} = require("../controllers/auth.controller");

const router = express.Router();

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token and slide refresh-token TTL
 *     description: >
 *       For **web** clients, sets an HTTP-only cookie and returns `accessToken`.
 *       For **mobile** clients, just returns `accessToken`.
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: X-Client-Platform
 *         schema:
 *           type: string
 *           enum: [mobile, web]
 *         description: >
 *           If `mobile`, include `refreshToken` in the JSON body. Otherwise, the cookie will be used.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Mobile clients only
 *     responses:
 *       200:
 *         description: Access token refreshed (cookie updated for web)
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
