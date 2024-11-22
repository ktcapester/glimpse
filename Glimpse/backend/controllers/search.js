const searcher = require("../services/search");

// Controller function for GET requests
const getCardSearch = async (req, res) => {
  const searchTerm = req.query.name;

  if (!searchTerm) {
    return res
      .status(400)
      .json({ error: "Search term is required.", errorCode: "NO_SEARCH_TERM" });
  }

  const result = await searcher.searchScryfall(searchTerm);
  // possible formats of result:
  // { status: 200, data: [obj] }
  // { status: 404 or 500, error:str, errorCode:str }
  if (result.status === 200) {
    return res.status(200).json(result.data);
  } else {
    return res
      .status(result.status)
      .json({ error: result.error, errorCode: result.errorCode });
  }
};

module.exports = { getCardSearch };
