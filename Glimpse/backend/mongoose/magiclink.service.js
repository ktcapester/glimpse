const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Token = require("./token.model");

// Utility: Create consistent errors
const createError = (status, message) => ({ status, message });

// Generate a secure random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Send magic link to user's email
async function sendMagicLink(email) {
  try {
    // Check for old unused tokens for the email
    const record = await Token.findOne({ email, used: false });
    // Delete if found
    if (record) {
      await Token.findByIdAndDelete(record._id);
    }

    // Create new token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

    // Save the token to the database
    await Token.create({ email, token, expiresAt });

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
    // I tested this locally and it at least works here.
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Magic Link",
      text: `Click here to log in: ${magicLink}`,
      html: `<a href="${magicLink}">Log in</a>`,
    });
  } catch (err) {
    console.error(err);
    throw {
      status: err.status || 500,
      message: err.message || "Server error",
    };
  }
}

const verifyToken = async (token, email) => {
  try {
    // Find the token in the database
    const record = await Token.findOne({ email, token, used: false });

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

    // successfully verified i suppose
    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, "User not found.");
    }
    // then issue JWT or create session
    // handled in controller file

    // Delete token after successful login
    await Token.findByIdAndDelete(record._id);

    return user;
  } catch (err) {
    console.error(err);
    throw {
      status: err.status || 500,
      message: err.message || "Server error",
    };
  }
};

module.exports = { sendMagicLink, verifyToken };
