const pricer = require("../services/price");
var lastAPICall = Date.now();

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchScryfall(searchTerm) {
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
        return {
          status: 404,
          error: "Scryfall found too many cards with that query.",
          errorCode: "CARD_AMBIGUOUS",
        };
      } else {
        return {
          status: 404,
          error: "Scryfall couldn't find a card with that query.",
          errorCode: "CARD_NOT_FOUND",
        };
      }
    } else {
      const result = await processAllPrints(scryfallData.prints_search_uri);
      return { status: 200, data: result };
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

async function processAllPrints(prints_search_uri) {
  // eg: "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab9cd714b-2ad8-4fdb-a8aa-82b17730e071&unique=prints"
  // I don't like that this sometimes gives me a digital version (Vintage Masters, etc)
  // Scryfall api card has .digital = true for mtgo versions, so filter it out in the all prints request
  const digital_filter = "+-is%3Adigital";
  const lidx = prints_search_uri.lastIndexOf("&unique=prints");
  const beginning_uri = prints_search_uri.slice(0, lidx);
  const end_uri = prints_search_uri.slice(lidx);
  const prints_no_digital = `${beginning_uri}${digital_filter}${end_uri}`;

  const all_response = await fetch(prints_no_digital);
  const all_data = await all_response.json();
  const calculated_prices = pricer.calculateAllPrices(all_data.data);

  // Use the first paper, non-promo card for getting the images
  var gidx = 0;
  while (all_data.data[gidx].promo === true) {
    gidx++;
  }
  const good_card = all_data.data[gidx];
  var img_src = "";
  if (good_card.image_uris) {
    img_src = good_card.image_uris.large;
  } else {
    img_src = good_card.card_faces[0].image_uris.large;
  }

  return {
    name: good_card.name,
    imgsrc: img_src,
    scryfallLink: good_card.scryfall_uri,
    ...calculated_prices,
  };
}

module.exports = { searchScryfall };
