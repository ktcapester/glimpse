/**
 * Service for managing card lists.
 * @module Services/List
 */

/**
 * @typedef {Object} module:Services/List~CardUpdateData
 * @property {number} [quantity] - New quantity of the card.
 * @property {{ calc: { usd: number } }} [prices] - Updated price info for the card.
 */

const { Card } = require("../models/card.model");
const { List } = require("../models/list.model");
const { createError } = require("../utils");

/**
 * Fetch all cards and the total price of a list.
 * @async
 * @function
 * @name module:Services/List.getAllCards
 * @param {string} listId - ID of the list.
 * @returns {Promise<module:Types/List~ListSummary>} An object containing the list of cards and the current total price.
 * @throws {Object} If the list is not found or a server error occurs.
 */
const getAllCards = async (listId) => {
  const list = await List.findById(listId).populate("cards.card");
  if (!list) throw createError(404, "List not found");
  return { list: list.cards, currentTotal: list.totalPrice };
};

/**
 * Add a card to a list.
 * @async
 * @function
 * @name module:Services/List.addCard
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card to add.
 * @returns {Promise<{ currentTotal: number }>} An object containing the updated total price of the list.
 * @throws Will throw an error if the card or list is not found or a server error occurs.
 */
const addCard = async (listId, cardId) => {
  const card = await Card.findById(cardId);
  if (!card) throw createError(404, "Card not found");

  const cardPrice = card.prices.calc.usd || 0;

  const listWithNewCard = await List.findOneAndUpdate(
    { _id: listId, "cards.card": { $ne: card._id } },
    {
      $push: { cards: { card: card._id, quantity: 1 } },
      $inc: { totalPrice: cardPrice },
    },
    { new: true }
  );

  if (!listWithNewCard) {
    const listWithUpdatedCard = await List.findOneAndUpdate(
      { _id: listId, "cards.card": card._id },
      {
        $inc: {
          "cards.$.quantity": 1,
          totalPrice: cardPrice,
        },
      },
      { new: true }
    );
    return { currentTotal: listWithUpdatedCard.totalPrice };
  }

  return { currentTotal: listWithNewCard.totalPrice };
};

/**
 * Clear all cards in a list.
 * @async
 * @function
 * @name module:Services/List.clearList
 * @param {string} listId - ID of the list.
 * @returns {Promise<module:Types/List~ListSummary>} An object containing an empty list and a total price of 0.
 * @throws Will throw an error if the list is not found or a server error occurs.
 */
const clearList = async (listId) => {
  const updatedList = await List.findByIdAndUpdate(
    listId,
    { $set: { cards: [], totalPrice: 0 } },
    { new: true }
  );
  if (!updatedList) throw createError(404, "List not found");
  return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
};

/**
 * Fetch a specific card from a list.
 * @async
 * @function
 * @name module:Services/List.getItem
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card to fetch.
 * @returns {Promise<Object>} The card entry from the list.
 * @throws Will throw an error if the list or card is not found or a server error occurs.
 */
const getItem = async (listId, cardId) => {
  const list = await List.findById(listId).populate("cards.card");
  if (!list) throw createError(404, "List not found");

  const entry = list.cards.find((c) => c.card._id.equals(cardId));
  if (!entry) throw createError(404, "Card not found in list");

  return entry;
};

/**
 * Update a specific card's details in a list.
 * @async
 * @function
 * @name module:Services/List.updateItem
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card to update.
 * @param {CardUpdateData} updates - Updates to apply (e.g., quantity or price).
 * @returns {Promise<module:Types/List~ListSummary>} An object containing the updated list and total price.
 * @throws Will throw an error if the list, card, or updates are invalid or a server error occurs.
 */
const updateItem = async (listId, cardId, updates) => {
  const card = await Card.findById(cardId);
  if (!card) throw createError(404, "Card not found in DB");
  const list = await List.findOne({ _id: listId, "cards.card": cardId });
  if (!list) throw createError(404, "List not found");

  // Short-circuit if no updates are provided
  if (!updates || Object.keys(updates).length === 0)
    return { list: list.cards, currentTotal: list.totalPrice };

  const cardEntry = list.cards.find((entry) => entry.card._id.equals(cardId));
  if (!cardEntry) throw createError(404, "Card not found in list");

  const oldPrice = card.prices.calc.usd || 0;
  const oldQuantity = cardEntry.quantity;

  const updateOps = { $set: {}, $inc: {} };

  // If there is a quantity update, handle it here
  if (updates.quantity !== undefined) {
    if (updates.quantity <= 0)
      throw createError(400, "Quantity must be greater than 0");
    const quantityDiff = updates.quantity - oldQuantity;
    updateOps.$set["cards.$.quantity"] = updates.quantity;
    updateOps.$inc.totalPrice = oldPrice * quantityDiff;
  }

  // If there is a price update, handle it here
  if (updates.prices?.calc?.usd !== undefined) {
    if (updates.prices.calc.usd < 0)
      throw createError(400, "Price must be non-negative");
    const newPrice = updates.prices.calc.usd;
    const priceDifference = newPrice - oldPrice;
    const effectiveQuantity =
      updates.quantity !== undefined ? updates.quantity : oldQuantity;
    // Save new price and update total price
    updateOps.$set["cards.$.prices.calc.usd"] = newPrice;
    updateOps.$inc.totalPrice =
      (updateOps.$inc.totalPrice || 0) + priceDifference * effectiveQuantity;
  }

  // Remove unused update operations
  if (Object.keys(updateOps.$set).length === 0) delete updateOps.$set;
  if (Object.keys(updateOps.$inc).length === 0) delete updateOps.$inc;

  // Update the list in one call
  const updatedList = await List.findOneAndUpdate(
    { _id: listId, "cards.card": cardId },
    updateOps,
    { new: true }
  );
  if (!updatedList) throw createError(404, "List or card not found");

  return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
};

/**
 * Remove a specific card from a list.
 * @async
 * @function
 * @name module:Services/List.removeItem
 * @param {string} listId - ID of the list.
 * @param {string} cardId - ID of the card to remove.
 * @returns {Promise<module:Types/List~ListSummary>} An object containing the updated list and total price.
 * @throws Will throw an error if the list or card is not found or a server error occurs.
 */
const removeItem = async (listId, cardId) => {
  const list = await List.findById(listId).populate("cards.card");
  if (!list) throw createError(404, "List not found");

  const card = list.cards.find((c) => c.card._id.equals(cardId));
  if (!card) throw createError(404, "Card not found in list");

  const cardPrice = card.card.prices.calc.usd || 0;

  const updatedList = await List.findByIdAndUpdate(
    listId,
    {
      $pull: { cards: { card: cardId } },
      $inc: { totalPrice: -(card.quantity * cardPrice) },
    },
    { new: true }
  );
  if (!updatedList) throw createError(404, "List or card not found");
  return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
};

module.exports = {
  getAllCards,
  addCard,
  clearList,
  getItem,
  updateItem,
  removeItem,
};
