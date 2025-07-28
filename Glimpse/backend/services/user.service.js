/**
 * Service for retrieving user data from the database.
 * @module Services/User
 */

const { User } = require("../models/user.model");
const { List } = require("../models/list.model");
const { RefreshToken } = require("../models/refreshtoken.model");
const { createError } = require("../utils");

/**
 * Fetch a user by their ID.
 * @async
 * @function
 * @name module:Services/User.getUserByID
 * @returns {Promise<Object>} The user document from the database.
 * @throws Will throw an error if the user is not found or a server error occurs.
 */
const getUserByID = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw createError(404, "User not found!");
  return user;
};

const deleteUserByID = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw createError(404, "User not found!");

  if (user.lists && user.lists.length > 0) {
    // delete the user's lists
    await List.deleteMany({ _id: { $in: user.lists } });
  }
  // delete the user's tokens
  await RefreshToken.deleteMany({ userId: user._id });

  // delete the user
  const result = await user.deleteOne();
  if (result.deletedCount === 0) {
    throw createError(500, "Failed to delete user.");
  }
  return true; // return true to indicate success
};

module.exports = {
  getUserByID,
  deleteUserByID,
};
