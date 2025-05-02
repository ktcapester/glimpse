// Delay function to slow down requests to Scryfall API
// Used in search.service.js and price.service.js
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// HTTP headers required by Scryfall API
// Used in search.service.js and price.service.js
export const headers = {
  "User-Agent": "GlimpseApp/1.0 (https://glimpsecard.com)",
  Accept: "application/json",
};
