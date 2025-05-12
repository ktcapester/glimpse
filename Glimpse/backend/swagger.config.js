const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Glimpse API",
      version: "1.0.0",
      description: "API documentation for the Glimpse backend",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Add other folders if needed
};

module.exports = options;
