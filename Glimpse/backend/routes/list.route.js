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

/**
 * Middleware to authenticate all routes in this router using JWT.
 */
router.use(authenticateJWT);

/**
 * GET all cards in a list.
 * @route GET /api/lists/:listId
 * @param {string} listId - ID of the list.
 */
router.get("/:listId", getList);

/**
 * POST a card to a list.
 * @route POST /api/lists/:listId
 * @param {string} listId - ID of the list.
 */
router.post("/:listId", postList);

/**
 * DELETE all cards in a list.
 * @route DELETE /api/lists/:listId
 * @param {string} listId - ID of the list.
 */
router.delete("/:listId", deleteList);

/**
 * GET a specific card from a list.
 * @route GET /api/lists/:listId/cards/:cardId
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
router.get("/:listId/cards/:cardId", getCard);

/**
 * PATCH a specific card in a list (update).
 * @route PATCH /api/lists/:listId/cards/:cardId
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
router.patch("/:listId/cards/:cardId", patchCard);

/**
 * DELETE a specific card from a list.
 * @route DELETE /api/lists/:listId/cards/:cardId
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
router.delete("/:listId/cards/:cardId", deleteCard);

module.exports = router;
