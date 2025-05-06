const { delay, headers, scryfallCardAPIBase } = require("../utils");

var lastAPICall = Date.now();

/**
 * Search for cards on Scryfall using a search term.
 * Returns either 1 result, up to 6 suggested results, or 0 results.
 * @async
 * @function searchScryfall
 * @param {string} searchTerm - The search term provided by the user.
 * @returns {Promise<Object>} An object containing the search results or an error message.
 * @throws Will throw an error if the Scryfall API request fails.
 */
async function searchScryfall(searchTerm) {
  try {
    const apiNamedurl = new URL(`${scryfallCardAPIBase}/named`);
    apiNamedurl.searchParams.append("fuzzy", searchTerm);

    const thisAPICall = Date.now();

    if (thisAPICall - lastAPICall < 100) {
      // Scryfall asks for 50-100ms between API calls, so wait for 100ms
      await delay(100);
    }

    lastAPICall = Date.now();

    const scryfallResponse = await fetch(apiNamedurl, { headers });
    const scryfallData = await scryfallResponse.json();

    if (scryfallResponse.status === 404) {
      if (scryfallData.type === "ambiguous") {
        const apiSearchurl = new URL(`${scryfallCardAPIBase}/search`);
        apiSearchurl.searchParams.append("q", searchTerm);
        const searchResponse = await fetch(apiSearchurl, { headers });
        const searchData = await searchResponse.json();
        if (searchResponse.status === 200) {
          // Retrieved a list of matching cards
          var cardsList = searchData.data;
          if (cardsList.length > 6) {
            cardsList = cardsList.slice(0, 6);
          }
          const manipd = cardsList.map((item) => {
            return {
              name: item.name,
              imgsrc: item.image_uris.normal, // Get smaller images for grid view
              scryfallLink: item.scryfall_uri,
            };
          });
          return { status: 200, data: manipd };
        }
      } else {
        // Scryfall didn't find any card matching the term
        return {
          status: 200,
          data: [],
        };
      }
    } else {
      return {
        status: 200,
        data: [
          {
            name: scryfallData.name,
            imgsrc: scryfallData.image_uris.large,
            scryfallLink: scryfallData.scryfall_uri,
          },
        ],
      };
    }
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      error: "An error occurred while fetching data from Scryfall.",
      errorCode: "SERVER_ERROR",
    };
  }
}

module.exports = { searchScryfall };
