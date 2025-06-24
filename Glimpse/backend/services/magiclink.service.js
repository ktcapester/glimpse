/**
 * Service functions for handling Magic Link authentication.
 * @module Services/MagicLink
 */

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { RefreshToken } = require("../models/refreshtoken.model");
const { Token } = require("../models/token.model");
const { User } = require("../models/user.model");
const { List } = require("../models/list.model");
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

/**
 * Send a magic link to the user's email.
 * @async
 * @function
 * @name module:Services/MagicLink.sendMagicLink
 * @param {string} email - The email address to send the magic link to.
 * @returns {Promise<void>}
 * @throws Will throw an error if the email sending fails or a server error occurs.
 */
const sendMagicLink = async (email) => {
  console.log("sending magic link to:", email);

  // Check for old unused tokens for the email
  const record = await Token.findOne({ email });
  // Delete if found
  if (record) {
    await Token.findByIdAndDelete(record._id);
  }
  // Create new token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 120); // Token expires in 120 minutes

  // Save the token to the database
  const dbtok = await Token.create({ email, token, expiresAt });
  console.log("new token saved to DB");
  console.log(dbtok);

  // Construct the magic link
  const magicLink = `${
    process.env.BASE_URL
  }/verify?token=${token}&email=${encodeURIComponent(email)}`;

  // Configure email transport
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send the email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Magic Link",
    text: `Click here to log in: ${magicLink}`,
    html: `<a href="${magicLink}">Log in</a>`,
  });
};

const loginWithMagicLink = async (token, email) => {
  console.log("verifying token+email:", token, email);

  // 1) Find & delete the unexpired token in one go
  const record = await Token.findOneAndDelete({
    email,
    token,
    expiresAt: { $gt: Date.now() },
  });

  if (!record) {
    throw createError(400, "Invalid or expired magic link.");
  }

  // 2) Find existing user or create one
  let user = await User.findOne({ email });
  if (!user) {
    // Create a new User
    const username = email.split("@")[0];
    user = await User.create({
      email: email,
      username: username,
    });
    // Create a default list
    const defaultList = await List.create({
      user: user._id, // connects the User into the List
      name: `${username} Default List`,
      description: `${username}'s auto generated list.`,
    });
    // Connect the List into the User
    user.lists = [defaultList._id];
    user.activeList = defaultList._id;
    await user.save();
  }
  console.log("resulting user ID:", user._id);

  // 3) Generate access and refresh tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);
  return { accessToken, refreshToken };
};

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
  sendMagicLink,
  loginWithMagicLink,
  refreshAccessToken,
  revokeRefreshToken,
};
