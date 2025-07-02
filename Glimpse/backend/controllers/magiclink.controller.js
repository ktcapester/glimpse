/**
 * Controller for handling Magic Link authentication.
 * @module Controllers/MagicLink
 */

/**
 * Request body for sending a magic link.
 * @typedef {Object} module:Controllers/MagicLink~MagicLinkRequestBody
 * @property {string} email - Email address to send the magic link to.
 */

/**
 * Specialization of the Express Request object for sending a magic link.
 * @typedef {Express.Request<any, any, MagicLinkRequestBody>} module:Controllers/MagicLink~MagicLinkRequest
 */

/**
 * Specialization of the Express Request object for verifying a magic link token.
 * @typedef {Express.Request<any, any, any, { token: string, email: string }>} module:Controllers/MagicLink~MagicLinkVerifyRequest
 */

const {
  sendMagicLink,
  loginWithMagicLink,
} = require("../services/magiclink.service");
const { createError } = require("../utils");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  domain: ".glimpsecard.com",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Send a magic link to the user's email.
 * @function
 * @name module:Controllers/MagicLink.postMagicLink
 * @param {MagicLinkRequest} req - The HTTP request containing the user's email in the body.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<{ message: string, success: boolean }>} Responds with a success message if the magic link is sent.
 */
const postMagicLink = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw createError(400, "Email is required.");

    await sendMagicLink(email);
    res.json({ message: "Magic link sent successfully.", success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify the magic link token and issue access and refresh tokens.
 * @function
 * @name module:Controllers/MagicLink.postLoginTokens
 * @param {MagicLinkVerifyRequest} req - The HTTP request containing token and email as query parameters.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<{ message: string, token: string }>} Responds with access and refresh tokens if verification is successful.
 */
const postLoginTokens = async (req, res, next) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      throw createError(400, "Token and email are required.");
    }
    const clientPlatform = req.header("X-Client-Platform")?.toLowerCase();

    const { accessToken, refreshToken } = await loginWithMagicLink(
      token,
      email
    );

    if (clientPlatform === "mobile") {
      // return both tokens as JSON so the app can store them
      return res.json({ accessToken, refreshToken });
    }

    // Set the refresh token in a secure cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTS);
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postMagicLink,
  postLoginTokens,
};
