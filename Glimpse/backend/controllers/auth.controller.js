const {
  refreshAccessToken,
  revokeRefreshToken,
} = require("../services/magiclink.service");
const { createError } = require("../utils");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  domain: ".glimpsecard.com",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const postRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw createError(401, "No refresh token provided.");
    }
    const newAccessToken = await refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

const postLogout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw createError(401, "No refresh token provided.");
    }
    await revokeRefreshToken(refreshToken);
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postRefreshToken,
  postLogout,
};
