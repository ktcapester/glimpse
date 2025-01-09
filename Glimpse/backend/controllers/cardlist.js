const CardListModel = require("../models/cardlist");

// Controller function for GET requests
const getList = (req, res) => {
  const data = CardListModel.getAllCards();
  res.json(data);
};

// Controller function for POST requests
const postList = (req, res) => {
  const newData = req.body;
  const createdData = CardListModel.addCard(newData);
  res.status(201).json(createdData);
};

const deleteList = (req, res) => {
  const response = CardListModel.clearList();
  res.json(response);
};

const getCard = (req, res) => {
  const item = req.params.id;
  const response = CardListModel.getItem(item);
  if (response.message) {
    res.status(404).json(response);
  } else {
    res.json(response);
  }
};

const patchCard = (req, res) => {
  const cardID = parseInt(req.params.id);
  const newData = req.body;
  const updatedResponse = CardListModel.updateItem(cardID, newData);
  if (updatedResponse.message) {
    res.status(404).json(updatedResponse);
  } else {
    res.json(updatedResponse);
  }
};

const deleteCard = (req, res) => {
  const item = req.params.id;
  const response = CardListModel.removeItem(item);
  if (response.message) {
    res.status(404).json(response);
  } else {
    res.json(response);
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
