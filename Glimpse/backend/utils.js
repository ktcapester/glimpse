/**
 * Delay function to slow down requests to Scryfall API.
 * @function delay
 * @param {number} ms - Number of milliseconds to delay.
 * @returns {Promise<void>} Resolves after the specified delay.
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP headers required by Scryfall API.
 * @constant
 * @type {Object}
 * @property {string} User-Agent - User agent string for the application.
 * @property {string} Accept - Accept header specifying JSON response format.
 */
const headers = {
  "User-Agent": "GlimpseApp/1.0 (https://glimpsecard.com)",
  Accept: "application/json",
};

/**
 * Base URL for Scryfall API calls to get/find cards.
 * @constant
 * @type {string}
 */
const scryfallCardAPIBase = "https://api.scryfall.com/cards";

/**
 * Create consistent error objects.
 * @function createError
 * @param {number} status - HTTP status code for the error.
 * @param {string} message - Error message.
 * @returns {Object} Error object with status and message properties.
 */
const createError = (status, message) => ({ status, message });

module.exports = {
  createError,
  delay,
  scryfallCardAPIBase,
  headers,
};
