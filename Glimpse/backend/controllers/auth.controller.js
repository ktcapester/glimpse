const {
  REFRESH_TOKEN_TTL_MS,
  refreshTokens,
  revokeRefreshToken,
} = require("../services/auth.service");
const { createError } = require("../utils");
const { LOGOUT_SUCCESS_STRING } = require("../../shared/constants");

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  domain: ".glimpsecard.com",
  maxAge: REFRESH_TOKEN_TTL_MS,
};

/**
 * POST /api/auth/refresh-token
 */
const postRefreshToken = async (req, res, next) => {
  try {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingToken) throw createError(401, "No refresh token provided.");

    const accessToken = await refreshTokens(incomingToken);

    // Slide the cookie TTL for web clients
    res.cookie("refreshToken", incomingToken, COOKIE_OPTS);

    // Return the access token for all clients
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
const postLogout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw createError(401, "No refresh token provided.");

    await revokeRefreshToken(token);
    res.clearCookie("refreshToken");
    res.json({ message: LOGOUT_SUCCESS_STRING });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  postRefreshToken,
  postLogout,
};
