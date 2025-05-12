const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerOptions = require("./swagger.config");
const searchRoute = require("./routes/search.route");
const priceRoute = require("./routes/price.route");
const listRoute = require("./routes/list.route");
const userRoute = require("./routes/user.route");
const magicLinkRoute = require("./routes/magiclink.route");

const app = express();

/**
 * Enable CORS for all routes with specific allowed origins, methods, and headers.
 */
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

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Root route to check server status.
 * @route GET /
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// Generate the Swagger spec
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve the Swagger UI at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * Route for card search functionality.
 * @route /api/search
 */
app.use("/api/search", searchRoute);

/**
 * Route for fetching card prices.
 * @route /api/price
 */
app.use("/api/price", priceRoute);

/**
 * Route for managing card lists.
 * @route /api/list
 */
app.use("/api/list", listRoute);

/**
 * Route for user-related operations.
 * @route /api/user
 */
app.use("/api/user", userRoute);

/**
 * Route for authentication using magic links.
 * @route /api/auth
 */
app.use("/api/auth", magicLinkRoute);

module.exports = app;
