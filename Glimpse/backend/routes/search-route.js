const express = require("express");
const { getCardSearch } = require("../controllers/search");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getCardSearch);

module.exports = router;
