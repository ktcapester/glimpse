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

function calculateAllPrices(cards) {
  // process all cards in here
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

function processList(cards, price_name) {
  if (cards.length == 0) {
    return NaN;
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

module.exports = { calculateAllPrices };
