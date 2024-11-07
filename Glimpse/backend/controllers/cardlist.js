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

module.exports = { getList, postList };
