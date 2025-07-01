jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));
jest.mock("../models/refreshtoken.model", () => ({
  RefreshToken: {
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

const authService = require("./auth.service");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { RefreshToken } = require("../models/refreshtoken.model");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "test-secret";
});

describe("generateAccessToken", () => {
  it("should generate a JWT access token", () => {
    // Arrange
    const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15; // 15 minutes
    const userId = "user";
    jwt.sign.mockReturnValue("signed-token");

    // Act
    const token = authService.generateAccessToken(userId);

    // Assert
    expect(jwt.sign).toHaveBeenCalledWith({ userId: "user" }, "test-secret", {
      expiresIn: `${ACCESS_TOKEN_TTL_MS}ms`,
    });
    expect(token).toBe("signed-token");
  });
});

describe("createRefreshToken", () => {
  it("should create a new refresh token and save it to the database", async () => {
    // Arrange
    const userId = "user";
    uuidv4.mockReturnValue("r-token");
    RefreshToken.create.mockResolvedValue();

    // Act
    const result = await authService.createRefreshToken(userId);

    // Assert
    expect(result).toBe("r-token");
    expect(RefreshToken.create).toHaveBeenCalledWith({
      token: "r-token",
      userId,
      expiresAt: expect.any(Date),
    });
  });
});

describe("refreshTokens", () => {
  const OLD_TOKEN = "old-refresh-token";
  const USER_ID = "user123";
  const NEW_ACCESS_TOKEN = "newAccessToken";

  beforeEach(() => {
    jwt.sign.mockReturnValue(NEW_ACCESS_TOKEN);
  });

  it("should throw if refresh token is invalid", async () => {
    // Arrange
    RefreshToken.findOneAndUpdate.mockResolvedValue(null);

    // Act & Assert
    await expect(authService.refreshTokens(OLD_TOKEN)).rejects.toThrow(
      "Refresh token missing or expired."
    );
    expect(RefreshToken.findOneAndUpdate).toHaveBeenCalledWith(
      { token: OLD_TOKEN, expiresAt: { $gt: expect.any(Date) } },
      { $set: { expiresAt: expect.any(Number) } },
      { new: true }
    );
  });

  it("should return a new access token for a valid refresh token", async () => {
    // Arrange
    RefreshToken.findOneAndUpdate.mockResolvedValue({
      userId: USER_ID,
    });

    // Act
    const token = await authService.refreshTokens(OLD_TOKEN);

    // Assert
    expect(jwt.sign).toHaveBeenCalledWith({ userId: USER_ID }, "test-secret", {
      expiresIn: `${1000 * 60 * 15}ms`,
    });
    expect(token).toBe(NEW_ACCESS_TOKEN);
  });
});

describe("revokeRefreshToken", () => {
  it("should delete the refresh token", async () => {
    // Arrange
    RefreshToken.deleteOne.mockResolvedValue();

    // Act
    await authService.revokeRefreshToken("torevoke");

    // Assert
    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ token: "torevoke" });
  });
});
