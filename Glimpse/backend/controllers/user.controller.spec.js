const { getUser } = require("./user.controller");
const userService = require("../services/user.service");
const { createError } = require("../utils");

jest.mock("../services/user.service");

describe("User Controller - getUser", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Arrange: set up fresh mocks for each test
    req = {};
    res = { json: jest.fn() };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next with 400 error if userId is missing", async () => {
    // Arrange: req.userId is undefined by default
    const error = createError(400, "User ID is required.");

    // Act
    await getUser(req, res, next);

    // Assert
    expect(userService.getUserByID).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should respond with user data when userService returns user", async () => {
    // Arrange
    const fakeUser = { id: "123", name: "Test User" };
    req.userId = "123";
    userService.getUserByID.mockResolvedValue(fakeUser);

    // Act
    await getUser(req, res, next);

    // Assert
    expect(userService.getUserByID).toHaveBeenCalledWith("123");
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should call next with error when userService throws an error", async () => {
    // Arrange
    const serviceError = new Error("Service failure");
    req.userId = "123";
    userService.getUserByID.mockRejectedValue(serviceError);

    // Act
    await getUser(req, res, next);

    // Assert
    expect(userService.getUserByID).toHaveBeenCalledWith("123");
    expect(next).toHaveBeenCalledWith(serviceError);
    expect(res.json).not.toHaveBeenCalled();
  });
});
