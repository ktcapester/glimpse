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

const {
  generateAccessToken,
  createRefreshToken,
  refreshTokens,
  revokeRefreshToken,
} = require("./auth.service");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { RefreshToken } = require("../models/refreshtoken.model");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "jwtsecret";
});

describe("generateAccessToken", () => {
  it("should generate a JWT access token", () => {
    // Arrange
    const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15; // 15 minutes
    const userId = "user";
    jwt.sign.mockReturnValue("signed-token");

    // Act
    const token = generateAccessToken(userId);

    // Assert
    expect(jwt.sign).toHaveBeenCalledWith({ userId: "user" }, "jwtsecret", {
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
    const result = await createRefreshToken(userId);

    // Assert
    expect(result).toBe("r-token");
    expect(RefreshToken.create).toHaveBeenCalled();
  });
});

describe("refreshTokens", () => {
  it("should throw if refresh token is invalid", async () => {
    // Arrange
    RefreshToken.findOneAndUpdate.mockResolvedValue(null);

    // Act & Assert
    await expect(refreshTokens("bad")).rejects.toThrow(
      "Refresh token missing or expired."
    );
  });

  it("should return a new access token for a valid refresh token", async () => {
    // Arrange
    RefreshToken.findOneAndUpdate.mockResolvedValue({
      userId: "u2",
    });
    generateAccessToken.mockReturnValue("new-access");

    // Act
    const token = await refreshTokens("good");

    // Assert
    expect(generateAccessToken).toHaveBeenCalledWith("u2");
    expect(token).toBe("new-access");
  });
});

describe("revokeRefreshToken", () => {
  it("should delete the refresh token", async () => {
    // Arrange
    RefreshToken.deleteOne.mockResolvedValue();

    // Act
    await revokeRefreshToken("torevoke");

    // Assert
    expect(RefreshToken.deleteOne).toHaveBeenCalledWith({ token: "torevoke" });
  });
});
