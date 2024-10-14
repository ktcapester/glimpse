const express = require("express");
const { getList, postList } = require("../controllers/cardlist");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getList);
router.post("/", postList);

module.exports = router;
