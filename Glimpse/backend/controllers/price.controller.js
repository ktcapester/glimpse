const pricer = require("../services/price.service");

/**
 * Controller function to get card prices by name.
 * @route GET /api/prices
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {string} req.query.name - Name of the card to fetch prices for.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the card price data or an error message.
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
