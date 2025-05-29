/**
 * Global error handler middleware for Express.js
 * Catches any errors passed to next(err) and sends a JSON response.
 */
module.exports = (err, req, res, next) => {
  // Log the error to the console
  console.error(err);

  // Set default status and message
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Send JSON response with error details
  res.status(status).json({ error: message });
};
