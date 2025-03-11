const express = require("express");
const cors = require("cors");
const searchRoute = require("./routes/search.route");
const priceRoute = require("./routes/price.route");
const listRoute = require("./routes/cardlist");
const connectToDatabase = require("./database"); // fix path

const app = express();

connectToDatabase();

// const allowedOrigins = [
//   "https://glimpsecard.com",
//   "https://www.glimpsecard.com",
//   "https://api.glimpsecard.com",
// ];

app.use(
  cors()
  //   {
  //   origin: allowedOrigins,
  //   methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  //   allowedHeaders: ["Content-Type", "Authorization"],
  // }
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/search", searchRoute);
app.use("/api/price", priceRoute);
app.use("/api/list", listRoute);

module.exports = app;
