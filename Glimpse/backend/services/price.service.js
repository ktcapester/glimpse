/**
 * Service functions for calculating card prices using Scryfall.
 * @module Services/Price
 */

/**
 * Calculated prices in various currencies and print types.
 * @typedef {Object} module:Services/Price~CalcPrices
 * @property {number} usd - Average price in USD.
 * @property {number} usd_etched - Average price in USD for etched foils.
 * @property {number} usd_foil - Average price in USD for foils.
 * @property {number} eur - Average price in EUR.
 * @property {number} eur_etched - Average price in EUR for etched foils.
 * @property {number} eur_foil - Average price in EUR for foils.
 */

const { Card } = require("../models/card.model");
const { delay, headers, scryfallCardAPIBase } = require("../utils");

var lastAPICall = Date.now();

/**
 * Calculate prices for a card by its name and add it to the database.
 * @async
 * @function
 * @name module:Services/Price.calculatePriceFromName
 * @param {string} cardName - Name of the card to fetch prices for.
 * @returns {Promise<Object>} The card document from the database or an error object.
 */
async function calculatePriceFromName(cardName) {
  try {
    const apiNamedurl = new URL(`${scryfallCardAPIBase}/named`);
    apiNamedurl.searchParams.append("fuzzy", cardName);

    const thisAPICall = Date.now();
    if (thisAPICall - lastAPICall < 100) {
      // scryfall asks for 50-100ms between API calls, so wait for 100ms
      await delay(100);
    }
    lastAPICall = Date.now();

    const scryfallResponse = await fetch(apiNamedurl, { headers });
    const scryfallData = await scryfallResponse.json();

    // if scryfall returns a valid single card
    if (scryfallResponse.status === 200) {
      // compute the calculated prices from all prints
      const allPrices = await processAllPrints(scryfallData.prints_search_uri);

      // build the raw prices object
      const rawPrices = {
        usd: parseFloat(scryfallData.prices.usd) || 0,
        usd_etched: parseFloat(scryfallData.prices.usd_etched) || 0,
        usd_foil: parseFloat(scryfallData.prices.usd_foil) || 0,
        eur: parseFloat(scryfallData.prices.eur) || 0,
        eur_etched: parseFloat(scryfallData.prices.eur_etched) || 0,
        eur_foil: parseFloat(scryfallData.prices.eur_foil) || 0,
      };

      // add to my DB, or update if already in it. aka "upsert" the card
      let found = await Card.findOne({ name: scryfallData.name });

      if (!found) {
        // Card.create both creates and saves in one step
        found = await Card.create({
          name: scryfallData.name,
          scryfallLink: scryfallData.scryfall_uri,
          imgsrcFull: scryfallData.image_uris.large,
          imgsrcSmall: scryfallData.image_uris.normal,
          prices: {
            raw: rawPrices,
            calc: allPrices,
          },
        });
      } else {
        // update existing Card
        found.scryfallLink = scryfallData.scryfall_uri;
        found.imgsrcFull = scryfallData.image_uris.large;
        found.imgsrcSmall = scryfallData.image_uris.small;
        found.prices.raw = rawPrices;
        found.prices.calc = allPrices;
        found = await found.save();
      }

      // Return the calc price data
      return { status: 200, data: found };
    }

    // if we got 404 from scryfall
    return {
      status: 500,
      error: "Got a 404 from Scryfall, check the card name you searched.",
      errorCode: "SERVER_ERROR",
    };
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      error: "An error occurred while fetching data from Scryfall.",
      errorCode: "SERVER_ERROR",
    };
  }
}

/**
 * Process all prints of a card and calculate their prices.
 * @async
 * @function
 * @name module:Services/Price.processAllPrints
 * @param {string} prints_search_uri - URI to fetch all prints of a card.
 * @returns {Promise<CalcPrices>} An object containing calculated prices for all prints.
 */
async function processAllPrints(prints_search_uri) {
  // eg: "https://api.scryfall.com/cards/search?order=released&q=oracleid%3Ab9cd714b-2ad8-4fdb-a8aa-82b17730e071&unique=prints"
  // I don't like that this sometimes gives me a digital version (Vintage Masters, etc)
  // Scryfall api card has .digital = true for mtgo versions, so filter it out in the all prints request
  const digital_filter = "+-is%3Adigital";
  const lidx = prints_search_uri.lastIndexOf("&unique=prints");
  const beginning_uri = prints_search_uri.slice(0, lidx);
  const end_uri = prints_search_uri.slice(lidx);
  const prints_no_digital = `${beginning_uri}${digital_filter}${end_uri}`;

  const thisAPICall = Date.now();
  if (thisAPICall - lastAPICall < 100) {
    // scryfall asks for 50-100ms between API calls, so wait for 100ms
    await delay(100);
  }
  lastAPICall = Date.now();

  const all_response = await fetch(prints_no_digital, { headers });
  const all_data = await all_response.json();
  return calculateAllPrices(all_data.data);
}

/**
 * Calculate average prices for all prints of a card.
 * @function
 * @name module:Services/Price.calculateAllPrices
 * @param {Array<Object>} cards - Array of card objects from Scryfall.
 * @returns {CalcPrices} An object containing average prices for all prints.
 */
function calculateAllPrices(cards) {
  var usd_cards = [];
  var usd_etched_cards = [];
  var usd_foil_cards = [];
  var eur_cards = [];
  var eur_etched_cards = [];
  var eur_foil_cards = [];

  for (let index = 0; index < cards.length; index++) {
    const element = cards[index];
    if (element.prices.usd) {
      usd_cards.push(element);
    }
    if (element.prices.usd_etched) {
      usd_etched_cards.push(element);
    }
    if (element.prices.usd_foil) {
      usd_foil_cards.push(element);
    }
    if (element.prices.eur) {
      eur_cards.push(element);
    }
    if (element.prices.eur_etched) {
      eur_etched_cards.push(element);
    }
    if (element.prices.eur_foil) {
      eur_foil_cards.push(element);
    }
  }

  let usd_avg = processList(usd_cards, "usd");
  let usd_etched_avg = processList(usd_etched_cards, "usd_etched");
  let usd_foil_avg = processList(usd_foil_cards, "usd_foil");
  let eur_avg = processList(eur_cards, "eur");
  let eur_etched_avg = processList(eur_etched_cards, "eur_etched");
  let eur_foil_avg = processList(eur_foil_cards, "eur_foil");

  return {
    usd: usd_avg,
    usd_etched: usd_etched_avg,
    usd_foil: usd_foil_avg,
    eur: eur_avg,
    eur_etched: eur_etched_avg,
    eur_foil: eur_foil_avg,
  };
}

/**
 * Process a list of cards to calculate a weighted average price.
 * @function
 * @name module:Services/Price.processList
 * @param {Array<Object>} cards - Array of card objects.
 * @param {string} price_name - The price field to process (e.g., "usd").
 * @returns {number} The calculated weighted average price.
 */
function processList(cards, price_name) {
  if (cards.length == 0) {
    return 0;
  }
  if (cards.length == 1) {
    return extractPrice(cards[0], price_name);
  }
  if (cards.length == 2) {
    // return the cheaper of the 2 prices
    const p0 = extractPrice(cards[0], price_name);
    const p1 = extractPrice(cards[1], price_name);
    if (p0 < p1) {
      return p0;
    }
    return p1;
  }
  // cards.length is at least 3
  // sort by price ascending
  cards.sort((a, b) => cardCompareFn(a, b, price_name));
  var medIdx = Math.floor(cards.length / 2);
  var median = extractPrice(cards[medIdx], price_name);
  if (cards.length % 2 == 0) {
    var lower = extractPrice(cards[medIdx - 1], price_name);
    median = (median + lower) / 2;
  }
  // pure median result:
  // return median

  // calculating a weighted average with inverse price difference from the median price as the weights
  var numerator = 0;
  var denominator = 0;
  for (let index = 0; index < cards.length; index++) {
    const element = cards[index];
    const price = extractPrice(element, price_name);
    if (Number.isNaN(price)) {
      console.log("NaN price for:", element);
    }
    var distance = Math.abs(median - price);
    if (distance == 0) {
      distance = 1;
    }
    const weight = 1 / distance;
    numerator += price * weight;
    denominator += weight;
  }
  return numerator / denominator;
}

/**
 * Extract a specific price from a card object.
 * @function
 * @name module:Services/Price.extractPrice
 * @param {Object} card - Card object.
 * @param {string} price_name - The price field to extract (e.g., "usd").
 * @returns {number} The extracted price or NaN if not available.
 */
function extractPrice(card, price_name) {
  switch (price_name) {
    case "usd":
      return Number.parseFloat(card.prices.usd);
    case "usd_etched":
      return Number.parseFloat(card.prices.usd_etched);
    case "usd_foil":
      return Number.parseFloat(card.prices.usd_foil);
    case "eur":
      return Number.parseFloat(card.prices.eur);
    case "eur_etched":
      return Number.parseFloat(card.prices.eur_etched);
    case "eur_foil":
      return Number.parseFloat(card.prices.eur_foil);
    default:
      return NaN;
  }
}

/**
 * Compare two cards based on a specific price field.
 * @function
 * @name module:Services/Price.cardCompareFn
 * @param {Object} card0 - First card object.
 * @param {Object} card1 - Second card object.
 * @param {string} price_name - The price field to compare (e.g., "usd").
 * @returns {number} A negative value if card0 < card1, positive if card0 > card1, or 0 if equal.
 */
function cardCompareFn(card0, card1, price_name) {
  const p0 = extractPrice(card0, price_name);
  const p1 = extractPrice(card1, price_name);
  if (Number.isNaN(p0)) {
    return 1;
  }
  if (Number.isNaN(p1)) {
    return -1;
  }
  return p0 - p1;
}

module.exports = { calculatePriceFromName };
