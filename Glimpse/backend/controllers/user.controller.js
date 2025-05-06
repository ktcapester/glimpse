const userService = require("../services/user.service");

/**
 * Controller function to get user details by ID.
 * @route GET /api/user
 * @param {Object} req - Express request object.
 * @param {Object} req.user - User object added by authentication middleware.
 * @param {string} req.user.userId - ID of the authenticated user.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the user details or an error message.
 */
const getUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await userService.getUserByID(userId);
    res.json(user);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
  getUser,
};
