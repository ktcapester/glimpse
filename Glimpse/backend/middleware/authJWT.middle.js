/**
 * Middleware for verifying JWT authentication tokens in requests.
 * @module Middleware/AuthJWT
 */

const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate requests using JWT.
 * @function
 * @name module:Middleware/AuthJWT.authenticateJWT
 * @param {Express.Request | { userId?: string }} req - Express request with optional userId property.
 * @param {Express.Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Responds with an error message if authentication fails, otherwise calls the next middleware.
 */
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: no token provided" });
  }
  const token = authHeader.substring(7); // Remove "Bearer " from the token string;

  try {
    // throws if token is invalid or expired
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired" });
    }

    return res.status(401).json({ error: "Invalid access token" });
  }
}

module.exports = authenticateJWT;
