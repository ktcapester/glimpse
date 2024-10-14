const express = require("express");
const { getCardSearch, postCardSearch } = require("../controllers/search");
const router = express.Router();

// Define routes & link to controller functions
router.get("/search", getCardSearch);

module.exports = router;
