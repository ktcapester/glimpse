const express = require("express");
const { getPrices } = require("../controllers/price");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getPrices);

module.exports = router;
