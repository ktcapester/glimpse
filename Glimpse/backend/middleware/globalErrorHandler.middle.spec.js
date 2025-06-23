const request = require("supertest");
const express = require("express");
const errorHandler = require("./globalErrorHandler.middle");

describe("Global Error Handler Middleware", () => {
  let app;

  beforeEach(() => {
    // Arrange: create a new express app and mount a route that triggers an error
    app = express();
    app.get("/error", (req, res, next) => {
      const err = new Error();
      next(err);
    });
    app.use(errorHandler);
  });

  test("should respond with 500 and default message for generic errors", async () => {
    // Act: send a request to the error route
    const response = await request(app).get("/error");

    // Assert: status and default error message
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });

  test("should respond with custom status and message when provided", async () => {
    // Arrange: create a new app instance for custom error
    app = express();
    app.get("/custom-error", (req, res, next) => {
      const err = new Error("Custom error message");
      err.status = 400;
      next(err);
    });
    app.use(errorHandler);

    // Act: send a request to the custom-error route
    const response = await request(app).get("/custom-error");

    // Assert: status and custom error message
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Custom error message" });
  });
});
