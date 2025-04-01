const express = require("express");
const { getPrices } = require("../controllers/price.controller");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getPrices);

module.exports = router;
