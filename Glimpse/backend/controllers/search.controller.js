const searcher = require("../services/search.service");

/**
 * Controller function to search for cards by name.
 * @route GET /api/search
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {string} req.query.name - Name of the card to search for.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the search results or an error message.
 */
const getCardSearch = async (req, res) => {
  const searchTerm = req.query.name;

  if (!searchTerm) {
    return res
      .status(400)
      .json({ error: "Search term is required.", errorCode: "NO_SEARCH_TERM" });
  }

  const result = await searcher.searchScryfall(searchTerm);
  // possible formats of result:
  // { status: 200, data: [{name,imgsrc,scryfallLink}] }
  // { status: 500, error:str, errorCode:str }
  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res
      .status(result.status)
      .json({ error: result.error, errorCode: result.errorCode });
  }
};

module.exports = { getCardSearch };
