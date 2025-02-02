const express = require("express");
const cors = require("cors");
const searchRoute = require("./routes/search-route");
const priceRoute = require("./routes/price");
const listRoute = require("./routes/cardlist");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/search", searchRoute);
app.use("/api/price", priceRoute);
app.use("/api/list", listRoute);

module.exports = app;
