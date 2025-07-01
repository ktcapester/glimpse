const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { RefreshToken } = require("../models/refreshtoken.model");
const { createError } = require("../utils");

// ms * sec * min * hr * day
const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15; // 15 minutes

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: `${ACCESS_TOKEN_TTL_MS}ms`,
  });
};

const createRefreshToken = async (userId) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await RefreshToken.create({
    token,
    userId,
    expiresAt,
  });
  return token;
};

const refreshTokens = async (refreshToken) => {
  // "Sliding expiration": reset the expiration time when we find a valid token
  const doc = await RefreshToken.findOneAndUpdate(
    { token: refreshToken, expiresAt: { $gt: new Date() } },
    { $set: { expiresAt: Date.now() + REFRESH_TOKEN_TTL_MS } },
    { new: true }
  );
  if (!doc) {
    throw createError(401, "Refresh token missing or expired.");
  }

  // Issue new access token
  return generateAccessToken(doc.userId);
};

const revokeRefreshToken = async (refreshToken) => {
  await RefreshToken.deleteOne({ token: refreshToken });
};

module.exports = {
  REFRESH_TOKEN_TTL_MS,
  generateAccessToken,
  createRefreshToken,
  refreshTokens,
  revokeRefreshToken,
};
