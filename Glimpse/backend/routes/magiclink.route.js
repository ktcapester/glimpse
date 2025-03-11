const express = require("express");
const {
  postMagicLink,
  getMagicToken,
} = require("../controllers/magiclink.controller");

const router = express.Router();

// Endpoint to request a magic link
router.post("/auth/magic-link", postMagicLink);

// Endpoint to verify the token
router.get("/auth/verify", getMagicToken);

module.exports = router;
