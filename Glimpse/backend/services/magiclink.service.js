/**
 * Service functions for handling Magic Link authentication.
 * @module Services/MagicLink
 */

const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Token } = require("../models/token.model");
const { User } = require("../models/user.model");
const { List } = require("../models/list.model");
const { createError } = require("../utils");

/**
 * Generate a secure random token.
 * @function
 * @name module:Services/MagicLink.generateToken
 * @returns {string} A secure random token as a hexadecimal string.
 */
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
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
async function sendMagicLink(email) {
  try {
    console.log("sending magic link to:", email);

    // Check for old unused tokens for the email
    const record = await Token.findOne({ email, used: false });
    // Delete if found
    if (record) {
      await Token.findByIdAndDelete(record._id);
    }
    console.log("old token deleted or not present");

    // Create new token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

    // Save the token to the database
    const dbtok = await Token.create({ email, token, expiresAt });
    console.log("new token saved to DB");
    console.log(dbtok._id);

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
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Magic Link",
      text: `Click here to log in: ${magicLink}`,
      html: `<a href="${magicLink}">Log in</a>`,
    });
    console.log("Sent mail info:", info);
  } catch (err) {
    console.log(err);
    const eStatus = err.status || 500;
    const eMessage = err.message || "Server error";
    throw createError(eStatus, eMessage);
  }
}

/**
 * Verify a magic link token and return the associated user.
 * @async
 * @function
 * @name module:Services/MagicLink.verifyToken
 * @param {string} token - The token to verify.
 * @param {string} email - The email address associated with the token.
 * @returns {Promise<Object>} The user object if verification is successful.
 * @throws Will throw an error if the token is invalid, expired, or a server error occurs.
 */
const verifyToken = async (token, email) => {
  try {
    console.log("verifying token+email:", token, email);

    // Find the token in the database
    const record = await Token.findOne({ email, token, used: false });
    console.log("found record:", record);
    if (!record) {
      throw createError(400, "Invalid or expired token.");
    }

    // Check if the token has expired
    if (record.expiresAt < Date.now()) {
      throw createError(400, "Token has expired.");
    }

    // Mark the token as used
    record.used = true;
    await record.save();

    console.log("looking for user with email:", email);

    // Token successfully verified, so find the User connected to it
    const user = await User.findOne({ email });
    if (!user) {
      console.log("no user found, creating new User");

      // Create a new User
      const usernamenew = email.split("@")[0];
      const newUser = new User({
        email: email,
        username: usernamenew,
      });
      await newUser.save();

      console.log("creating default list for new user");

      // Create a default list
      const defaultList = new List({
        user: newUser._id, // connects the User into the List
        name: `${usernamenew} Default List`,
        description: `${usernamenew}'s auto generated list.`,
      });
      await defaultList.save();

      console.log("connecting list to user");

      // Connect the List into the User
      newUser.lists.push(defaultList._id);
      newUser.activeList = defaultList._id;
      await newUser.save();

      console.log("new User created & saved:", newUser);

      // Delete token after successful signup
      await Token.findByIdAndDelete(record._id);
      console.log("user token deleted");

      // Return the new User
      return newUser;
    }

    // Delete token after successful login
    await Token.findByIdAndDelete(record._id);
    console.log("user token deleted for User:", user);

    // Return the existing User
    return user;
  } catch (err) {
    console.log(err);
    const eStatus = err.status || 500;
    const eMessage = err.message || "Server error";
    throw createError(eStatus, eMessage);
  }
};

module.exports = { sendMagicLink, verifyToken };
