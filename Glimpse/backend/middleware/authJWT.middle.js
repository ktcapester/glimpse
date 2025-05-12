/**
 * Middleware for verifying JWT authentication tokens in requests.
 * @module Middleware/AuthJWT
 */

/**
 * Decoded JWT payload structure.
 * @typedef {Object} module:Middleware/AuthJWT~DecodedJWT
 * @property {string} userId - ID of the authenticated user.
 * @property {string} email - Email address of the authenticated user.
 * @property {number} iat - Issued at timestamp.
 * @property {number} exp - Expiration timestamp.
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate requests using JWT.
 * @function
 * @name module:Middleware/AuthJWT.authenticateJWT
 * @param {Express.Request & { user?: DecodedJWT }} req - Express request with optional user property.
 * @param {Express.Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Responds with an error message if authentication fails, otherwise calls the next middleware.
 */
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateJWT;
