const { getUserByID } = require("./user.service");
const { User } = require("../models/user.model");
const { createError } = require("../utils");

jest.mock("../models/user.model");
jest.mock("../utils");

describe("User Service - getUserByID", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the user when found", async () => {
    // Arrange
    const mockUser = { _id: "abc123", name: "Alice" };
    User.findById.mockResolvedValue(mockUser);

    // Act
    const result = await getUserByID("abc123");

    // Assert
    expect(User.findById).toHaveBeenCalledWith("abc123");
    expect(result).toBe(mockUser);
  });

  it("should throw a 404 error when user is not found", async () => {
    // Arrange
    User.findById.mockResolvedValue(null);
    const error = new Error("User not found!");
    error.status = 404;
    createError.mockReturnValue(error);

    // Act & Assert
    await expect(getUserByID("nonexistent")).rejects.toBe(error);
    expect(User.findById).toHaveBeenCalledWith("nonexistent");
    expect(createError).toHaveBeenCalledWith(404, "User not found!");
  });
});
