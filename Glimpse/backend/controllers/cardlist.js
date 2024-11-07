const CardListModel = require("../models/cardlist");

// Controller function for GET requests
const getList = (req, res) => {
  const data = CardListModel.getAllCards();
  res.json(data);
};

// Controller function for POST requests
const postList = (req, res) => {
  const newData = req.body;
  const createdData = CardListModel.addCard(newData.card);
  res.status(201).json(createdData);
};

const deleteList = (req, res) => {
  const response = CardListModel.clearList();
  res.json(response);
};

const removeItem = (req, res) => {
  const item = req.params.id;
  const response = CardListModel.removeItem(item);
  if (response.message) {
    res.status(404).json(response);
  } else {
    res.json(response);
  }
};

module.exports = { getList, postList, deleteList, removeItem };
