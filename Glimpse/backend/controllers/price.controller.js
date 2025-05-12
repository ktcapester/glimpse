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

/**
 * Get card prices by name.
 * @function
 * @name module:Controllers/Price.getPrices
 * @param {PriceRequest} req - The HTTP request containing the card name as a query parameter.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the card price data or an error message.
 */
const getPrices = async (req, res) => {
  const cardName = req.query.name;

  if (!cardName) {
    return res
      .status(400)
      .json({ error: "Card name is required.", errorCode: "NO_CARD_NAME" });
  }

  const result = await pricer.calculatePriceFromName(cardName);
  // possible formats of result:
  // { status: 200, data: CardSchema }
  // { status:  500, error:str, errorCode:str }
  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res
      .status(result.status)
      .json({ error: result.error, errorCode: result.errorCode });
  }
};

module.exports = { getPrices };
