/**
 * @swagger
 * components:
 *   schemas:
 *     ListParams:
 *       type: object
 *       properties:
 *         listId:
 *           type: string
 *           description: The ID of the list.

 *     CardParams:
 *       type: object
 *       properties:
 *         listId:
 *           type: string
 *         cardId:
 *           type: string
 *       required:
 *         - listId
 *         - cardId
 *       description: Path parameters for card operations.

 *     CardUpdateBody:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           description: New quantity of the card.
 *       required: []
 *       description: Request body for updating card quantity.

 *     CardInList:
 *       type: object
 *       properties:
 *         card:
 *           type: object
 *           description: Card object details.
 *         quantity:
 *           type: integer
 *           description: Number of copies in the list.

 *     ListResponse:
 *       type: object
 *       properties:
 *         list:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CardInList'
 *         currentTotal:
 *           type: number
 *           description: Total price of all cards in the list.
 */

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
 * @param {string} listId - ID of the list.
 */
/**
 * @swagger
 * /api/lists/{listId}:
 *   get:
 *     summary: Get all cards in a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List with cards and total price
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
router.get("/:listId", getList);

/**
 * POST a card to a list.
 * @param {string} listId - ID of the list.
 */
/**
 * @swagger
 * /api/lists/{listId}:
 *   post:
 *     summary: Add a card to a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Updated total price of the list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentTotal:
 *                   type: number
 *       404:
 *         description: List or card not found
 *       500:
 *         description: Server error
 */
router.post("/:listId", postList);

/**
 * DELETE all cards in a list.
 * @param {string} listId - ID of the list.
 */
/**
 * @swagger
 * /api/lists/{listId}:
 *   delete:
 *     summary: Clear all cards from a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empty list with total price reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       404:
 *         description: List not found
 *       500:
 *         description: Server error
 */
router.delete("/:listId", deleteList);

/**
 * GET a specific card from a list.
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
/**
 * @swagger
 * /api/lists/{listId}/cards/{cardId}:
 *   get:
 *     summary: Get a specific card from a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card with quantity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 card:
 *                   type: object
 *                 quantity:
 *                   type: integer
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
router.get("/:listId/cards/:cardId", getCard);

/**
 * PATCH a specific card in a list (update).
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
/**
 * @swagger
 * /api/lists/{listId}/cards/{cardId}:
 *   patch:
 *     summary: Update a card's quantity in a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardUpdateBody'
 *     responses:
 *       200:
 *         description: Updated list with new total price
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
router.patch("/:listId/cards/:cardId", patchCard);

/**
 * DELETE a specific card from a list.
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card.
 */
/**
 * @swagger
 * /api/lists/{listId}/cards/{cardId}:
 *   delete:
 *     summary: Remove a specific card from a list
 *     tags: [Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated list with new total price
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       404:
 *         description: Card not found
 *       500:
 *         description: Server error
 */
router.delete("/:listId/cards/:cardId", deleteCard);

module.exports = router;
