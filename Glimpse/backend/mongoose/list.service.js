const { Card } = require("./card.model");
const { List } = require("./list.model");

// Utility: Create consistent errors
const createError = (status, message) => ({ status, message });

// Fetch all cards and the total price
const getAllCards = async (listId) => {
  try {
    const list = await List.findById(listId).populate("cards.card");
    if (!list) throw createError(404, "List not found");
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
    const card = await Card.findById(cardData.cardId);
    if (!card) throw createError(404, "Card not found");

    const cardPrice = card.prices.calc.usd || 0;
    const quantity = cardData.quantity || 1;

    const list = await List.findOneAndUpdate(
      { _id: listId, "cards.card": { $ne: card._id } },
      {
        $push: { cards: { card: card._id, quantity } },
        $inc: { totalPrice: cardPrice * quantity },
      },
      { new: true }
    );

    if (!list) {
      const updatedList = await List.findOneAndUpdate(
        { _id: listId, "cards.card": card._id },
        {
          $inc: {
            "cards.$.quantity": quantity,
            totalPrice: cardPrice * quantity,
          },
        },
        { new: true }
      );
      return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
    }

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
    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $set: { cards: [], totalPrice: 0 } },
      { new: true }
    );
    if (!updatedList) throw createError(404, "List not found");
    return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
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
    const list = await List.findById(listId).populate("cards.card");
    if (!list) throw createError(404, "List not found");

    const card = list.cards.find((c) => c.card._id.equals(cardId));
    if (!card) throw createError(404, "Card not found in list");

    return card;
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
    const card = await Card.findById(cardId);
    if (!card) throw createError(404, "Card not found");

    const updatesToApply = {};
    if (updates.quantity !== undefined) {
      if (updates.quantity <= 0)
        throw createError(400, "Quantity must be greater than 0");
      updatesToApply["cards.$.quantity"] = updates.quantity;
    }
    if (updates.prices?.calc?.usd !== undefined) {
      if (updates.prices.calc.usd < 0)
        throw createError(400, "Price must be non-negative");
      const priceDifference =
        updates.prices.calc.usd - (card.prices.calc.usd || 0);
      updatesToApply.totalPrice = { $inc: priceDifference * updates.quantity };
    }

    const updatedList = await List.findOneAndUpdate(
      { _id: listId, "cards.card": cardId },
      { $set: updatesToApply },
      { new: true }
    );
    if (!updatedList) throw createError(404, "List or card not found");
    return { list: updatedList.cards, currentTotal: updatedList.totalPrice };
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
