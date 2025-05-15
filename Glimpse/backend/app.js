const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerOptions = require("./swagger.config");
const searchRoute = require("./routes/search.route");
const priceRoute = require("./routes/price.route");
const listRoute = require("./routes/list.route");
const userRoute = require("./routes/user.route");
const magicLinkRoute = require("./routes/magiclink.route");
const errorHandler = require("./middleware/globalErrorHandler.middle");

const app = express();

/**
 * Enable trust proxy to properly handle HTTPS and client IP when behind AWS ELB.
 */
app.enable("trust proxy"); // So req.secure and req.protocol reflect ELB settings

/**
 * Define allowed CORS origins.
 */
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
 * Middleware to parse cookies.
 */
app.use(cookieParser());

/**
 * Middleware to parse incoming JSON requests.
 */
app.use(express.json());

/**
 * Root route to check server status.
 */
app.get("/", (req, res) => {
  res.send("Hello world!");
});

/**
 * Generate & serve Swagger documentation at /docs.
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Glimpse API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    customfavIcon: "https://glimpsecard.com/favicon.ico",
  })
);

/**
 * API routes.
 */
app.use("/api/search", searchRoute);
app.use("/api/price", priceRoute);
app.use("/api/list", listRoute);
app.use("/api/user", userRoute);
app.use("/api/auth", magicLinkRoute);

// after ALL routes, add the error handler
app.use(errorHandler);

module.exports = app;
