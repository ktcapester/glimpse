const express = require("express");
const {
  getList,
  postList,
  deleteList,
  deleteCard,
  getCard,
  patchCard,
} = require("../controllers/cardlist");
const router = express.Router();

// Define routes & link to controller functions
router.get("/:id", getCard);
router.get("/", getList);
router.delete("/:id", deleteCard);
router.delete("/", deleteList);
router.patch("/:id", patchCard);
router.post("/", postList);

module.exports = router;
