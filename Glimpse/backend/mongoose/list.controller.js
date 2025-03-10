const listService = require("./list.service");

// GET all cards in a list
// Route example: GET /api/lists/:listId
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

// POST a new card into a list
// Route example: POST /api/lists/:listId
// req.body should include { cardId, quantity }
const postList = async (req, res) => {
  try {
    const listId = req.params.listId;
    // cardId, quantity, etc. come from the request body
    const { cardId, quantity } = req.body;
    const response = await listService.addCard(listId, { cardId, quantity });
    // response contains { list: updatedList.cards, currentTotal: updatedList.totalPrice }
    res.status(201).json(response);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

// DELETE all cards from a list (clearList)
// Route example: DELETE /api/lists/:listId
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

// GET a specific card from a list
// Route example: GET /api/lists/:listId/cards/:cardId
const getCard = async (req, res) => {
  try {
    const { listId, cardId } = req.params;
    const response = await listService.getItem(listId, cardId);
    // response is the card object
    res.json(response);
  } catch (error) {
    // If our service throws a 404, use that status
    res.status(error.status || 500).json({ error: error.message });
  }
};

// PATCH a specific card in a list (e.g., update its quantity)
// Route example: PATCH /api/lists/:listId/cards/:cardId
// req.body may include { quantity } or updated price info
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

// DELETE a specific card from a list
// Route example: DELETE /api/lists/:listId/cards/:cardId
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
