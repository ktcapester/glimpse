const express = require("express");
const { getCardSearch } = require("../controllers/search.controller");
const router = express.Router();

/**
 * GET request to search for cards by name.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for cards by name
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the card to search for
 *     responses:
 *       200:
 *         description: Search results found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   imgsrc:
 *                     type: string
 *                     description: URL of the card's image
 *                   scryfallLink:
 *                     type: string
 *                     description: Link to the card on Scryfall
 *       400:
 *         description: Missing search term
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Search term is required.
 *                 errorCode:
 *                   type: string
 *                   example: NO_SEARCH_TERM
 *       500:
 *         description: Internal server error
 */
router.get("/", getCardSearch);

module.exports = router;
