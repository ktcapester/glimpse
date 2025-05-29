const express = require("express");
const { getPrices } = require("../controllers/price.controller");
const router = express.Router();

/**
 * GET request to fetch card prices by name.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
/**
 * @swagger
 * /api/prices:
 *   get:
 *     summary: Get pricing information for a card by name
 *     tags: [Prices]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the card to get pricing for
 *     responses:
 *       200:
 *         description: Pricing information found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Card price information (format depends on service output)
 *       400:
 *         description: Missing card name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Card name is required.
 *                 errorCode:
 *                   type: string
 *                   example: NO_CARD_NAME
 *       500:
 *         description: Internal server error
 */
router.get("/", getPrices);

module.exports = router;
