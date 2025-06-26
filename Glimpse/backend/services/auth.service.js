const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { RefreshToken } = require("../models/refreshtoken.model");
const { createError } = require("../utils");

// ms * sec * min * hr * day
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
}

async function createRefreshToken(userId) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE);
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });
  return token;
}

const refreshAccessToken = async (refreshToken) => {
  const refreshDoc = await RefreshToken.findOne({ token: refreshToken });

  if (!refreshDoc) {
    throw createError(401, "Invalid refresh token.");
  }

  if (refreshDoc.expiresAt < Date.now()) {
    throw createError(401, "Refresh token has expired.");
  }

  return generateAccessToken(refreshDoc.userId);
};

const revokeRefreshToken = async (refreshToken) => {
  await RefreshToken.deleteOne({ token: refreshToken });
};

module.exports = {
  refreshAccessToken,
  revokeRefreshToken,
};
