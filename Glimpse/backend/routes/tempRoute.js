const express = require("express");
const { getData, postData } = require("../controllers/tempController");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getData);
router.post("/", postData);

module.exports = router;
