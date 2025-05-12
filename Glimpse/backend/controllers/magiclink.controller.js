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

const { sendMagicLink, verifyToken } = require("../services/magiclink.service");
const jwt = require("jsonwebtoken");

/**
 * Send a magic link to the user's email.
 * @function
 * @name module:Controllers/MagicLink.postMagicLink
 * @param {MagicLinkRequest} req - The HTTP request containing the user's email in the body.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<{ message: string, success: boolean }>} Responds with a success message if the magic link is sent.
 */
const postMagicLink = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    await sendMagicLink(email);
    res.json({ message: "Magic link sent successfully.", success: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Verify the magic link token and issue a JWT.
 * @function
 * @name module:Controllers/MagicLink.getMagicToken
 * @param {MagicLinkVerifyRequest} req - The HTTP request containing token and email as query parameters.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<{ message: string, token: string }>} Responds with a JWT if verification is successful.
 */
const getMagicToken = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).json({ error: "Token and email are required." });
    }

    const user = await verifyToken(token, email);
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // Generate JWT for authentication
    const authToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login successful.", token: authToken });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
  postMagicLink,
  getMagicToken,
};
