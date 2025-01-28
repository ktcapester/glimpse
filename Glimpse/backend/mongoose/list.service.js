const { Card } = require("./card.model");
const { List } = require("./list.model");

// Utility: Create consistent errors
const createError = (status, message) => ({ status, message });

// Utility: Find list with optional population
const findListById = async (listId, populate = false) => {
  const query = populate
    ? List.findById(listId).populate("cards.card")
    : List.findById(listId);
  const list = await query;
  if (!list) throw createError(404, "List not found");
  return list;
};

// Utility: Find card index in list
const findCardIndex = (list, cardId) => {
  const cardIndex = list.cards.findIndex((c) => c.card._id.equals(cardId));
  if (cardIndex === -1) throw createError(404, "Card not found in list");
  return cardIndex;
};

// Fetch all cards and the total price
const getAllCards = async (listId) => {
  try {
    const list = await findListById(listId, true);
    return { list: list.cards, currentTotal: list.totalPrice };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

// Add a card to a list
const addCard = async (listId, cardData) => {
  try {
    const list = await findListById(listId);
    const card = await Card.findById(cardData.cardId);
    if (!card) throw createError(404, "Card not found");

    const cardPrice = card.prices.calc.usd || 0;
    const quantity = cardData.quantity || 1;

    const existingCardIndex = list.cards.findIndex((c) =>
      c.card.equals(card._id)
    );
    if (existingCardIndex === -1) {
      list.cards.push({ card: card._id, quantity });
      list.totalPrice += cardPrice * quantity;
    } else {
      const existingCard = list.cards[existingCardIndex];
      list.totalPrice += cardPrice * (quantity - existingCard.quantity);
      existingCard.quantity = quantity;
    }

    await list.save();
    return { list: list.cards, currentTotal: list.totalPrice };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

// Clear all cards in a list
const clearList = async (listId) => {
  try {
    const list = await findListById(listId);
    list.cards = [];
    list.totalPrice = 0; // Reset the total price
    await list.save();

    return { list: list.cards, currentTotal: list.totalPrice };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

// Fetch a specific card from a list
const getItem = async (listId, cardId) => {
  try {
    const list = await findListById(listId, true);
    const cardIndex = findCardIndex(list, cardId);
    return list.cards[cardIndex];
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

// Update a specific card's details in a list
const updateItem = async (listId, cardId, updates) => {
  try {
    const list = await findListById(listId, true);
    const cardIndex = findCardIndex(list, cardId);

    const card = list.cards[cardIndex];
    const cardPrice = card.card.prices.calc.usd || 0;

    // Validate and handle critical fields
    if (updates.quantity !== undefined) {
      if (updates.quantity <= 0)
        throw createError(400, "Quantity must be greater than 0");
      list.totalPrice += cardPrice * (updates.quantity - card.quantity);
      card.quantity = updates.quantity;
    }

    if (updates.prices?.calc?.usd !== undefined) {
      if (updates.prices.calc.usd < 0)
        throw createError(400, "Price must be a non-negative number");
      list.totalPrice += (updates.prices.calc.usd - cardPrice) * card.quantity;
      card.card.prices.calc.usd = updates.prices.calc.usd;
    }

    // Use Object.assign for non-critical fields
    const allowedUpdates = Object.keys(card.toObject()); // Ensure only valid fields are updated
    Object.assign(
      card,
      Object.keys(updates).reduce((validUpdates, key) => {
        if (
          allowedUpdates.includes(key) &&
          key !== "quantity" &&
          key !== "prices"
        ) {
          validUpdates[key] = updates[key];
        }
        return validUpdates;
      }, {})
    );

    await list.save();
    return { list: list.cards, currentTotal: list.totalPrice };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

// Remove a specific card from a list
const removeItem = async (listId, cardId) => {
  try {
    const list = await findListById(listId, true);
    const cardIndex = findCardIndex(list, cardId);

    const card = list.cards[cardIndex];
    const cardPrice = card.card.prices.calc.usd || 0;
    list.totalPrice -= cardPrice * card.quantity;

    list.cards.splice(cardIndex, 1);
    await list.save();

    return { list: list.cards, currentTotal: list.totalPrice };
  } catch (error) {
    throw {
      status: error.status || 500,
      message: error.message || "Server error",
    };
  }
};

module.exports = {
  getAllCards,
  addCard,
  clearList,
  getItem,
  updateItem,
  removeItem,
};
