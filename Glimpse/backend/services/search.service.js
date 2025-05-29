/**
 * Service for searching cards using the Scryfall API.
 * @module Services/Search
 */

/**
 * Search result entry returned from Scryfall.
 * @typedef {Object} module:Services/Search~CardSearchResult
 * @property {string} name - Name of the card.
 * @property {string} imgsrc - URL to the card image (normal or large size).
 * @property {string} scryfallLink - URL to the card's Scryfall page.
 */

const {
  delay,
  headers,
  scryfallCardAPIBase,
  createError,
} = require("../utils");

let lastAPICall = Date.now();

/**
 * Search for cards on Scryfall using a search term.
 * Returns either 1 result, up to 6 suggested results, or 0 results.
 * @async
 * @function
 * @name module:Services/Search.searchScryfall
 * @param {string} searchTerm - The search term provided by the user.
 * @returns {Promise<CardSearchResult[]>} An array of search results.
 * @throws Will throw an error if the Scryfall API request fails.
 */
async function searchScryfall(searchTerm) {
  const apiNamedurl = new URL(`${scryfallCardAPIBase}/named`);
  apiNamedurl.searchParams.append("fuzzy", searchTerm);

  if (Date.now() - lastAPICall < 100) {
    // Scryfall asks for 50-100ms between API calls, so wait for 100ms
    await delay(100);
  }
  lastAPICall = Date.now();

  const scryfallResponse = await fetch(apiNamedurl, { headers });

  if (scryfallResponse.status === 404) {
    const scryfallData = await scryfallResponse.json();

    if (scryfallData.type === "ambiguous") {
      const apiSearchurl = new URL(`${scryfallCardAPIBase}/search`);
      apiSearchurl.searchParams.append("q", searchTerm);

      if (Date.now() - lastAPICall < 100) {
        // Scryfall asks for 50-100ms between API calls, so wait for 100ms
        await delay(100);
      }
      lastAPICall = Date.now();

      const searchResponse = await fetch(apiSearchurl, { headers });
      const searchData = await searchResponse.json();
      if (!searchResponse.ok) {
        throw createError(502, "Error fetching suggestions from Scryfall.");
      }

      // Retrieve up to 6 cards from the results
      const cardsList = searchData.data.slice(0, 6);
      // Manipulate the data into the desired format
      const manipd = cardsList.map((item) => ({
        name: item.name,
        imgsrc: item.image_uris.normal, // Get smaller images for grid view
        scryfallLink: item.scryfall_uri,
      }));
      return manipd;
    }
    // Scryfall didn't find any card matching the term
    return [];
  }
  if (!scryfallResponse.ok) {
    throw createError(502, "Error fetching card data from Scryfall.");
  }
  const singleData = await scryfallResponse.json();
  return [
    {
      name: singleData.name,
      imgsrc: singleData.image_uris.large,
      scryfallLink: singleData.scryfall_uri,
    },
  ];
}

module.exports = { searchScryfall };
