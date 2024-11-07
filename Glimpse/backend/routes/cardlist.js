const express = require("express");
const {
  getList,
  postList,
  deleteList,
  removeItem,
} = require("../controllers/cardlist");
const router = express.Router();

// Define routes & link to controller functions
router.get("/", getList);
router.post("/", postList);
router.delete("/", deleteList);
router.delete("/:id", removeItem);

module.exports = router;
