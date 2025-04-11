const express = require("express");
const cors = require("cors");
const searchRoute = require("./routes/search.route");
const priceRoute = require("./routes/price.route");
const listRoute = require("./routes/list.route");
const userRoute = require("./routes/user.route");
const magicLinkRoute = require("./routes/magiclink.route");

const app = express();

app.options("*", cors());

const allowedOrigins = [
  "https://glimpsecard.com",
  "https://www.glimpsecard.com",
  "https://api.glimpsecard.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.use("/api/search", searchRoute);
app.use("/api/price", priceRoute);
app.use("/api/list", listRoute);
app.use("/api/user", userRoute);
app.use("/api/auth", magicLinkRoute);

module.exports = app;
