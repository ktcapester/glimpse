const userService = require("../services/user.service");

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
