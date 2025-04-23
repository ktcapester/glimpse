const pricer = require("../services/price.service");

// Controller function for GET requests
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
