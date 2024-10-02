const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/data", (req, res) => {
  res.json({ message: "Here is some data" });
});

module.exports = app;
