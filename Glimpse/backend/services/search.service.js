const { delay, headers } = require("../utils");

var lastAPICall = Date.now();

// basically we use this to filter user's search term:
// return either 1 result, 6 suggested results, or 0 results
async function searchScryfall(searchTerm) {
  try {
    const scryfallAPIbase = "https://api.scryfall.com/";
    const apiNamedurl = new URL(`${scryfallAPIbase}/cards/named`);
    apiNamedurl.searchParams.append("fuzzy", searchTerm);

    const thisAPICall = Date.now();

    if (thisAPICall - lastAPICall < 100) {
      // scryfall asks for 50-100ms between API calls, so wait for 100ms
      await delay(100);
    }

    lastAPICall = Date.now();

    const scryfallResponse = await fetch(apiNamedurl, { headers });
    const scryfallData = await scryfallResponse.json();

    if (scryfallResponse.status === 404) {
      if (scryfallData.type === "ambiguous") {
        const apiSearchurl = new URL(`${scryfallAPIbase}/cards/search`);
        apiSearchurl.searchParams.append("q", searchTerm);
        const searchResponse = await fetch(apiSearchurl, { headers });
        const searchData = await searchResponse.json();
        if (searchResponse.status === 200) {
          // retrieved a list of matching cards
          var cardsList = searchData.data;
          if (cardsList.length > 6) {
            cardsList = cardsList.slice(0, 6);
          }
          const manipd = cardsList.map((item) => {
            return {
              name: item.name,
              imgsrc: item.image_uris.normal, // get smaller images for grid view
              scryfallLink: item.scryfall_uri,
            };
          });
          return { status: 200, data: manipd };
        }
      } else {
        // scryfall didn't find any card matching the term
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
