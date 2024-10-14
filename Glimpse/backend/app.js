const express = require("express");
const cors = require("cors");
const tempRoute = require("./routes/tempRoute");
const searchRoute = require("./routes/search-route");
const listRoute = require("./routes/cardlist");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/temp", tempRoute);

app.use("/api/search", searchRoute);
app.use("/api/list", listRoute);

module.exports = app;
