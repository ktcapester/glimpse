const express = require("express");
const {
  getList,
  postList,
  deleteList,
  deleteCard,
  getCard,
  patchCard,
} = require("../controllers/list.controller");
const authenticateJWT = require("../middleware/authJWT.middle");

const router = express.Router();

// Authenticate the JWT on every route used by this router
router.use(authenticateJWT);

// Define routes & link to controller functions
// GET all cards in a list
router.get("/:listId", getList);
// POST a card to a list
router.post("/:listId", postList);
// DELETE all cards in a list
router.delete("/:listId", deleteList);
// GET a card from a list
router.get("/:listId/cards/:cardId", getCard);
// PATCH a card in a list (update)
router.patch("/:listId/cards/:cardId", patchCard);
// DELETE a card from a list
router.delete("/:listId/cards/:cardId", deleteCard);

module.exports = router;
