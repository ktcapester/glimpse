const express = require("express");
const { postMagicLink, getMagicToken } = require("./magiclink.controller");
const authenticateJWT = require("../middleware/authJWT.middle");

const router = express.Router();

// Endpoint to request a magic link
router.post("/auth/magic-link", postMagicLink);

// Endpoint to verify the token
router.get("/auth/verify", getMagicToken);

// Protected: Example of a protected route (e.g., user profile)
router.get("/auth/protected", authenticateJWT, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

module.exports = router;
