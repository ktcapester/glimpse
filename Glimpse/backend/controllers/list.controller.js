const listService = require("../services/list.service");

/**
 * Get all cards in a list.
 * @route GET /api/lists/:listId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the list of cards and the current total price.
 */
const getList = async (req, res) => {
  try {
    const listId = req.params.listId;
    const data = await listService.getAllCards(listId);
    // data contains { list: list.cards, currentTotal: list.totalPrice }
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Add a new card to a list.
 * @route POST /api/lists/:listId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.cardId - ID of the card to add.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the updated total price of the list.
 */
const postList = async (req, res) => {
  try {
    const listId = req.params.listId;
    // cardId, quantity, etc. come from the request body
    const { cardId } = req.body;
    const response = await listService.addCard(listId, cardId);
    // response contains { currentTotal: updatedList.totalPrice }
    res.status(201).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Clear all cards from a list.
 * @route DELETE /api/lists/:listId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with an empty list and a total price of 0.
 */
const deleteList = async (req, res) => {
  try {
    const listId = req.params.listId;
    const response = await listService.clearList(listId);
    // response contains { list: [], currentTotal: 0 }
    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Get a specific card from a list.
 * @route GET /api/lists/:listId/cards/:cardId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {string} req.params.cardId - ID of the card.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the card details and its quantity.
 */
const getCard = async (req, res) => {
  try {
    const { listId, cardId } = req.params;
    const response = await listService.getItem(listId, cardId);
    // response is { card:Card, quantity:number}
    res.json(response);
  } catch (error) {
    // If our service throws a 404, use that status
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Update a specific card in a list (e.g., update its quantity).
 * @route PATCH /api/lists/:listId/cards/:cardId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {string} req.params.cardId - ID of the card.
 * @param {Object} req.body - Request body containing updates (e.g., quantity).
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the updated list and total price.
 */
const patchCard = async (req, res) => {
  try {
    const { listId, cardId } = req.params;
    const updates = req.body;
    const response = await listService.updateItem(listId, cardId, updates);
    // response contains { list: updatedList.cards, currentTotal: updatedList.totalPrice }
    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

/**
 * Remove a specific card from a list.
 * @route DELETE /api/lists/:listId/cards/:cardId
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.listId - ID of the list.
 * @param {string} req.params.cardId - ID of the card.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Responds with the updated list and total price.
 */
const deleteCard = async (req, res) => {
  try {
    const { listId, cardId } = req.params;
    const response = await listService.removeItem(listId, cardId);
    // response contains { list: updatedList.cards, currentTotal: updatedList.totalPrice }
    res.json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

module.exports = {
  getList,
  postList,
  deleteList,
  getCard,
  patchCard,
  deleteCard,
};
