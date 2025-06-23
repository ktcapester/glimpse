const { getPrices } = require("./price.controller");
const pricer = require("../services/price.service");
const { createError } = require("../utils");

jest.mock("../services/price.service");

describe("Price Controller - getPrices", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset request, response, and next function before each test
    req = { query: {} };
    res = { json: jest.fn() };
    next = jest.fn();

    // Clear any previous mock implementations or calls
    pricer.calculatePriceFromName.mockReset();
  });

  it("should call next with 400 error when card name is missing", async () => {
    // Arrange
    const error = createError(400, "Card name is required.");

    // Act
    await getPrices(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should return price result when card name is provided", async () => {
    // Arrange
    req.query.name = "Black Lotus";
    const mockResult = { price: 100000 };
    pricer.calculatePriceFromName.mockResolvedValue(mockResult);

    // Act
    await getPrices(req, res, next);

    // Assert
    expect(pricer.calculatePriceFromName).toHaveBeenCalledWith("Black Lotus");
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it("should call next with error when service throws", async () => {
    // Arrange
    req.query.name = "Time Walk";
    const serviceError = new Error("Service error");
    pricer.calculatePriceFromName.mockRejectedValue(serviceError);

    // Act
    await getPrices(req, res, next);

    // Assert
    expect(pricer.calculatePriceFromName).toHaveBeenCalledWith("Time Walk");
    expect(next).toHaveBeenCalledWith(serviceError);
  });
});
