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
const { createError } = require("../utils");

/**
 * Search for cards by name.
 * @function
 * @name module:Controllers/Search.getCardSearch
 * @param {SearchRequest} req - The HTTP request containing the search term as a query parameter.
 * @param {Express.Response} res - The HTTP response object.
 * @returns {Promise<Express.Response>} Responds with the search results or an error message.
 */
const getCardSearch = async (req, res, next) => {
  const searchTerm = req.query.name;
  if (!searchTerm) {
    return next(createError(400, "Search term is required."));
  }

  try {
    const result = await searcher.searchScryfall(searchTerm);
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getCardSearch };
