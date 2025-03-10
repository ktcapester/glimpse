const express = require("express");
const {
  getList,
  postList,
  deleteList,
  deleteCard,
  getCard,
  patchCard,
} = require("./list.controller");

const router = express.Router();

// Define routes & link to controller functions
router.get("/:listId", getList);
router.post("/:listId", postList);
router.delete("/:listId", deleteList);
router.get("/:listId/cards/:cardId", getCard);
router.patch("/:listId/cards/:cardId", patchCard);
router.delete("/:listId/cards/:cardId", deleteCard);

module.exports = router;
