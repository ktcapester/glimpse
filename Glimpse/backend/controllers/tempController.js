const TempModel = require("../models/tempModel");

// Controller function for GET requests
const getData = (req, res) => {
  const data = TempModel.getAllData();
  res.json(data);
};

// Controller function for POST requests
const postData = (req, res) => {
  const newData = req.body;
  const createdData = TempModel.addData(newData);
  res.status(201).json(createdData);
};

module.exports = { getData, postData };
