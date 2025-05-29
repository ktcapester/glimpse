/**
 * Controller for retrieving authenticated user information.
 * @module Controllers/User
 */

/**
 * Specialization of the Express Request object for user retrieval.
 * @typedef {Express.Request<any, any, any, any> & { userId: string }} module:Controllers/User~UserRequest
 */

const userService = require("../services/user.service");
const { createError } = require("../utils");

/**
 * Get details of the authenticated user.
 * @function
 * @name module:Controllers/User.getUser
 * @param {UserRequest} req - The HTTP request containing the authenticated user.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the user details or an error message.
 */
const getUser = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return next(createError(400, "User ID is required."));
  }

  try {
    const user = await userService.getUserByID(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};
