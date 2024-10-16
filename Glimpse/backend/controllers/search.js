import pricer from "../models/price";

// Controller function for GET requests
const getCardSearch = async (req, res) => {
  const searchTerm = req.query.query;

  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required." });
  }

  try {
    const scryfallAPIurl = new URL("https://api.scryfall.com/cards/named");
    scryfallAPIurl.searchParams.append("fuzzy", searchTerm);

    const scryfallResponse = await fetch(scryfallAPIurl);

    const scryfallData = await scryfallResponse.json();

    if (scryfallResponse.status == 404) {
      if (scryfallData.type == "ambiguous") {
        res
          .status(404)
          .json({ error: "Scryfall found too many cards with that query." });
      } else {
        res
          .status(404)
          .json({ error: "Scryfall couldn't find a card with that query." });
      }
    } else {
      const all_prints_uri = scryfallData.prints_search_uri;
      const all_response = await fetch(all_prints_uri);
      const all_data = await all_response.json();
      const calculated_prices = pricer.calculateAllPrices(all_data);
      var img_src = "";
      if (scryfallData.img_uris) {
        img_src = scryfallData.img_uris.large;
      } else {
        img_src = scryfallData.card_faces[0].img_uris.large;
      }

      const manipulated = {
        name: scryfallData.name,
        imgsrc: img_src,
        ...calculated_prices,
      };

      res.status(200).json(manipulated);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching data from Scryfall." });
  }
};

// Controller function for POST requests
const postCardSearch = (req, res) => {};

module.exports = { getCardSearch, postCardSearch };
