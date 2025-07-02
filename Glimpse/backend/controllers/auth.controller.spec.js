const authService = require("../services/auth.service");
const { createError } = require("../utils");
const { postRefreshToken, postLogout } = require("./auth.controller");

jest.mock("../services/auth.service");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, cookies: {} };
    res = {
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postRefreshToken", () => {
    it("should return a new access token when refreshToken in cookies", async () => {
      // Arrange
      req.cookies.refreshToken = "valid-refresh";
      const data = { accessToken: "new-access" };
      authService.refreshTokens.mockResolvedValue(data.accessToken);

      // Act
      await postRefreshToken(req, res, next);

      // Assert
      expect(authService.refreshTokens).toHaveBeenCalledWith("valid-refresh");
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should return a new access token when refreshToken in body", async () => {
      // Arrange
      req.body.refreshToken = "valid-refresh";
      const data = { accessToken: "new-access" };
      authService.refreshTokens.mockResolvedValue(data.accessToken);

      // Act
      await postRefreshToken(req, res, next);

      // Assert
      expect(authService.refreshTokens).toHaveBeenCalledWith("valid-refresh");
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should error with no refresh token", async () => {
      // Arrange
      req.cookies = {};
      const data = createError(401, "No refresh token provided.");

      // Act
      await postRefreshToken(req, res, next);

      // Assert
      expect(authService.refreshTokens).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(data);
    });
  });

  describe("postLogout", () => {
    it("should clear the secure cookie", async () => {
      // Arrange
      req.cookies.refreshToken = "valid-refresh";
      const data = { message: "Logged out" };
      authService.revokeRefreshToken.mockResolvedValue();

      // Act
      await postLogout(req, res, next);

      // Assert
      expect(authService.revokeRefreshToken).toHaveBeenCalledWith(
        "valid-refresh"
      );
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should error with no refresh token", async () => {
      // Arrange
      req.cookies = {};
      const data = createError(401, "No refresh token provided.");

      // Act
      await postLogout(req, res, next);

      // Assert
      expect(authService.revokeRefreshToken).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(data);
    });
  });
});
