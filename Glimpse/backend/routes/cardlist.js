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
router.get("/", getList);
router.post("/", postList);
router.delete("/", deleteList);
router.get("/:id", getCard);
router.patch("/:id", patchCard);
router.delete("/:id", deleteCard);

module.exports = router;
