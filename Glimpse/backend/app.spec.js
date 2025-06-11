const request = require("supertest");
const app = require("./app"); // Adjust path if needed based on your test folder structure

describe("App Initialization", () => {
  // Arrange (shared setup)
  const server = request(app);

  it("should respond to GET / with 'Hello world!'", async () => {
    // Act
    const response = await server.get("/");

    // Assert
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello world!");
  });

  it("should serve Swagger docs at /docs", async () => {
    // Act
    const response = await server.get("/docs");

    // Assert
    expect(response.status).toBe(200);
    expect(response.text).toContain("Swagger UI");
  });

  it("should return 404 for unknown routes", async () => {
    // Act
    const response = await server.get("/non-existent-route");

    // Assert
    expect(response.status).toBe(404);
  });
});
