const express = require("express");
const {
  postMagicLink,
  getMagicToken,
} = require("../controllers/magiclink.controller");

const router = express.Router();

// Endpoint to request a magic link
router.post("/magic-link", postMagicLink);

// Endpoint to verify the token
router.get("/verify", getMagicToken);

module.exports = router;
