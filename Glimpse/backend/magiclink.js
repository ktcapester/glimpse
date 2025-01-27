// app.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Token = require("./models/Token");

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Generate a secure random token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Send magic link to user's email
async function sendMagicLink(email) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes

  // Save the token to the database
  await Token.create({ email, token, expiresAt });

  // Construct the magic link
  const magicLink = `${
    process.env.BASE_URL
  }/login?token=${token}&email=${encodeURIComponent(email)}`;

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
}

// Endpoint to request a magic link
app.post("/request-magic-link", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    await sendMagicLink(email);
    res.status(200).json({ message: "Magic link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send magic link" });
  }
});
