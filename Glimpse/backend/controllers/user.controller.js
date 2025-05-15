/**
 * Controller for retrieving authenticated user information.
 * @module Controllers/User
 */

/**
 * User data added by authentication middleware.
 * @typedef {Object} module:Controllers/User~AuthenticatedUser
 * @property {string} userId - ID of the authenticated user.
 */

/**
 * Specialization of the Express Request object for user retrieval.
 * @typedef {Express.Request<any, any, any, any> & { user: module:Controllers/User~AuthenticatedUser }} module:Controllers/User~UserRequest
 */

const userService = require("../services/user.service");

/**
 * Get details of the authenticated user.
 * @function
 * @name module:Controllers/User.getUser
 * @param {UserRequest} req - The HTTP request containing the authenticated user.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the user details or an error message.
 */
const getUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserByID(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUser,
};
