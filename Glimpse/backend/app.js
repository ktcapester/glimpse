const express = require("express");
const cors = require("cors");
const tempRoute = require("./routes/tempRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/temp", tempRoute);

module.exports = app;
