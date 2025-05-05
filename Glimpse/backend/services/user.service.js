const { User } = require("../models/user.model");
const { createError } = require("../utils");

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
