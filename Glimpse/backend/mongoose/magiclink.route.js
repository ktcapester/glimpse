const express = require("express");
const { postMagicLink, getMagicToken } = require("./magiclink.controller");
const authenticateJWT = require("../middleware/authJWT.middle");

const router = express.Router();

// Endpoint to request a magic link
router.post("/auth/magic-link", postMagicLink);

// Endpoint to verify the token
router.get("/auth/verify", getMagicToken);

module.exports = router;
