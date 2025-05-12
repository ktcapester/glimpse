/**
 * Controller for searching cards by name.
 * @module Controllers/Search
 */

/**
 * Query parameters for searching cards.
 * @typedef {Object} module:Controllers/Search~SearchQuery
 * @property {string} name - Name of the card to search for.
 */

/**
 * Specialization of the Express Request object for card search.
 * @typedef {Express.Request<any, any, any, SearchQuery>} module:Controllers/Search~SearchRequest
 */

const searcher = require("../services/search.service");

/**
 * Search for cards by name.
 * @function
 * @name module:Controllers/Search.getCardSearch
 * @param {SearchRequest} req - The HTTP request containing the search term as a query parameter.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the search results or an error message.
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
