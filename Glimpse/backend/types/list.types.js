/**
 * Shared types for list-related data structures.
 * @module Types/List
 */

/**
 * Format of cards in a populated list result.
 * @typedef {Object} CardInList
 * @property {module:Models/Card~CardDocument} card - Fully populated card document.
 * @property {number} quantity - Quantity of the card in the list.
 */

/**
 * Summary of a list, including card entries and total price.
 * @typedef {Object} module:Types/List~ListSummary
 * @property {CardInList[]} list - Array of card entries.
 * @property {number} currentTotal - Total price of the list.
 */
