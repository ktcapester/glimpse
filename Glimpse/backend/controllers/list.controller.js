/**
 * Controller for managing lists of cards.
 * @module Controllers/List
 */

/**
 * Parameter needed for operations involving whole lists.
 * @typedef {Object} module:Controllers/List~ListParams
 * @property {string} listId - ID of the list.
 */

/**
 * Parameters needed for operations involving specific cards in a list.
 * @typedef {Object} module:Controllers/List~CardParams
 * @property {string} listId - ID of the list.
 * @property {string} cardId - ID of the card.
 */

/**
 * Parameter needed in the body of the HTTP request for operations involving updating cards in a list.
 * @typedef {Object} module:Controllers/List~CardUpdateBody
 * @property {number} [quantity] - New quantity of the card.
 */

/**
 * Specialization of the Express Request object for operations involving whole lists.
 * @typedef {Express.Request<ListParams>} module:Controllers/List~ListRequest
 */

/**
 * Specialization of the Express Request object for operations involving specific cards in a list.
 * @typedef {Express.Request<CardParams>} module:Controllers/List~CardRequest
 */

/**
 * Specialization of the Express Request object for operations involving updating cards in a list.
 * @typedef {Express.Request<CardParams, any, CardUpdateBody>} module:Controllers/List~CardUpdateRequest
 */

/**
 * Specialization of the Express Request object for operations involving adding cards to a list.
 * @typedef {Express.Request<ListParams, any, { cardId: string }>} module:Controllers/List~CardPostRequest
 */

const listService = require("../services/list.service");

/**
 * Get all cards in a list.
 * @function
 * @name module:Controllers/List.getList
 * @param {ListRequest} req
 * @param {Express.Response} res
 * @returns {Promise<module:Types/List~ListSummary>}
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
 * @function
 * @name module:Controllers/List.postList
 * @param {CardPostRequest} req
 * @param {Express.Response} res
 * @returns {Promise<{ currentTotal: number }>}
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
 * @function
 * @name module:Controllers/List.deleteList
 * @param {ListRequest} req
 * @param {Express.Response} res
 * @returns {Promise<module:Types/List~ListSummary>} Responds with an empty list and a total price of 0.
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
 * @function
 * @name module:Controllers/List.getCard
 * @param {CardRequest} req
 * @param {Express.Response} res
 * @returns {Promise<module:Types/List~CardInList>} The card object and its quantity in the list.
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
 * @function
 * @name module:Controllers/List.patchCard
 * @param {CardUpdateRequest} req
 * @param {Express.Response} res
 * @returns {Promise<module:Types/List~ListSummary>}
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
 * @function
 * @name module:Controllers/List.deleteCard
 * @param {CardRequest} req
 * @param {Express.Response} res
 * @returns {Promise<module:Types/List~ListSummary>}
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
