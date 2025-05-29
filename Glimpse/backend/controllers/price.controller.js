/**
 * Controller for fetching card prices.
 * @module Controllers/Price
 */

/**
 * Query parameters for fetching card prices.
 * @typedef {Object} module:Controllers/Price~PriceQuery
 * @property {string} name - Name of the card to fetch prices for.
 */

/**
 * Specialization of the Express Request object for fetching prices.
 * @typedef {Express.Request<any, any, any, PriceQuery>} module:Controllers/Price~PriceRequest
 */

const pricer = require("../services/price.service");
const { createError } = require("../utils");

/**
 * Get card prices by name.
 * @function
 * @name module:Controllers/Price.getPrices
 * @param {PriceRequest} req - The HTTP request containing the card name as a query parameter.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the card price data or an error message.
 */
const getPrices = async (req, res, next) => {
  const cardName = req.query.name;
  if (!cardName) {
    return next(createError(400, "Card name is required."));
  }

  try {
    const result = await pricer.calculatePriceFromName(cardName);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getPrices };
