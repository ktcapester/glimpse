var lastAPICall = Date.now();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const scryfallResponse = await fetch(apiNamedurl);

    const scryfallData = await scryfallResponse.json();

    if (scryfallResponse.status == 404) {
      if (scryfallData.type == "ambiguous") {
        const apiSearchurl = new URL(`${scryfallAPIbase}/cards/search`);
        apiSearchurl.searchParams.append("q", searchTerm);
        const searchResponse = await fetch(apiSearchurl);
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
              imgsrc: item.image_uris.small,
              scryfallLink: item.scryfall_uri,
            };
          });
          return { status: 200, data: manipd };
        }
      } else {
        return {
          status: 404,
          error: "Scryfall couldn't find a card with that query.",
          errorCode: "CARD_NOT_FOUND",
        };
      }
    } else {
      return {
        status: 200,
        data: {
          name: scryfallData.name,
          imgsrc: scryfallData.image_uris.small,
          scryfallLink: scryfallData.scryfall_uri,
        },
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
