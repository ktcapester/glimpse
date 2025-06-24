const { getCardSearch } = require("./search.controller");
const searcher = require("../services/search.service");
const { createError } = require("../utils");

jest.mock("../services/search.service");

describe("Search Controller – getCardSearch", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // reset mocks and fake req/res
    jest.clearAllMocks();
    req = { query: {} };
    res = { json: jest.fn() };
    next = jest.fn();
  });

  it("should call next with 400 when no name query provided", async () => {
    // Arrange
    req.query.name = undefined;

    // Act
    await getCardSearch(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(
      createError(400, "Search term is required.")
    );
  });

  it("should return results when service resolves successfully", async () => {
    // Arrange
    req.query.name = "Black Lotus";
    const fakeResults = { data: [{ id: "xyz", name: "Black Lotus" }] };
    searcher.searchScryfall.mockResolvedValue(fakeResults);

    // Act
    await getCardSearch(req, res, next);

    // Assert
    expect(searcher.searchScryfall).toHaveBeenCalledWith("Black Lotus");
    expect(res.json).toHaveBeenCalledWith(fakeResults);
  });

  it("should forward errors thrown by the service to next()", async () => {
    // Arrange
    req.query.name = "Ancestral Recall";
    const svcError = new Error("Service failure");
    searcher.searchScryfall.mockRejectedValue(svcError);

    // Act
    await getCardSearch(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledWith(svcError);
  });
});
