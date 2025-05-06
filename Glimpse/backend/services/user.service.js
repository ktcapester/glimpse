const { User } = require("../models/user.model");
const { createError } = require("../utils");

/**
 * Fetch a user by their ID.
 * @async
 * @function getUserByID
 * @param {string} userId - ID of the user to fetch.
 * @returns {Promise<Object>} The user document from the database.
 * @throws Will throw an error if the user is not found or a server error occurs.
 */
const getUserByID = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw createError(404, "User not found!");
    return user;
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

module.exports = {
  getUserByID,
};
