const pricer = require("../models/price");
var lastAPICall = Date.now();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Controller function for GET requests
const getCardSearch = async (req, res) => {
  const searchTerm = req.query.name;

  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required." });
  }

  try {
    const scryfallAPIurl = new URL("https://api.scryfall.com/cards/named");
    scryfallAPIurl.searchParams.append("fuzzy", searchTerm);

    const thisAPICall = Date.now();

    if (thisAPICall - lastAPICall < 100) {
      // scryfall asks for 50-100ms between API calls, so wait for 100ms
      await delay(100);
    }

    lastAPICall = thisAPICall;

    const scryfallResponse = await fetch(scryfallAPIurl);

    const scryfallData = await scryfallResponse.json();

    if (scryfallResponse.status == 404) {
      if (scryfallData.type == "ambiguous") {
        return res.status(404).json({
          error: "Scryfall found too many cards with that query.",
          errorCode: "CARD_AMBIGUOUS",
        });
      } else {
        return res.status(404).json({
          error: "Scryfall couldn't find a card with that query.",
          errorCode: "CARD_NOT_FOUND",
        });
      }
    } else {
      const all_prints_uri = scryfallData.prints_search_uri;
      const all_response = await fetch(all_prints_uri);
      const all_data = await all_response.json();
      const calculated_prices = pricer.calculateAllPrices(all_data.data);
      var img_src = "";
      if (scryfallData.image_uris) {
        img_src = scryfallData.image_uris.large;
      } else {
        img_src = scryfallData.card_faces[0].image_uris.large;
      }

      const manipulated = {
        name: scryfallData.name,
        imgsrc: img_src,
        scryfallLink: scryfallData.scryfall_uri,
        ...calculated_prices,
      };

      res.status(200).json(manipulated);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "An error occurred while fetching data from Scryfall.",
      errorCode: "SERVER_ERROR",
    });
  }
};

// Controller function for POST requests
const postCardSearch = (req, res) => {};

module.exports = { getCardSearch, postCardSearch };
