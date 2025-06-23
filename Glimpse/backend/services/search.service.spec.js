// Mock the utils module before importing the service
jest.mock("../utils", () => ({
  delay: jest.fn(() => Promise.resolve()), // resolve immediately in tests
  headers: { "x-test-header": "test" },
  scryfallCardAPIBase: "https://api.scryfall.com",
  createError: jest.fn((status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
  }),
}));

const { searchScryfall } = require("./search.service");
const utils = require("../utils");

describe("searchScryfall", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("returns a single result when Scryfall named endpoint succeeds", async () => {
    // Arrange
    const mockCard = {
      name: "TestCard",
      image_uris: { large: "https://img.large.png" },
      scryfall_uri: "https://scry.link",
    };
    global.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: jest.fn().mockResolvedValue(mockCard),
    });

    // Act
    const results = await searchScryfall("TestCard");

    // Assert
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(results).toEqual([
      {
        name: "TestCard",
        imgsrc: "https://img.large.png",
        scryfallLink: "https://scry.link",
      },
    ]);
  });

  it("throws when named endpoint returns non-404 error", async () => {
    // Arrange
    global.fetch.mockResolvedValueOnce({
      status: 500,
      ok: false,
    });

    // Act & Assert
    await expect(searchScryfall("ErrorCard")).rejects.toThrow(
      "Error fetching card data from Scryfall."
    );
    expect(utils.createError).toHaveBeenCalledWith(
      502,
      "Error fetching card data from Scryfall."
    );
  });

  it("returns empty array when named endpoint 404 and type is not ambiguous", async () => {
    // Arrange
    global.fetch.mockResolvedValueOnce({
      status: 404,
      ok: false,
      json: jest.fn().mockResolvedValue({ type: "not_ambiguous" }),
    });

    // Act
    const results = await searchScryfall("MissingCard");

    // Assert
    expect(results).toEqual([]);
  });

  it("returns up to 6 suggestions when named endpoint 404 with ambiguous type", async () => {
    // Arrange
    // First call: named endpoint returns ambiguous
    global.fetch
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
        json: jest.fn().mockResolvedValue({ type: "ambiguous" }),
      })
      // Second call: search endpoint returns a list of 10 cards
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: Array.from({ length: 10 }).map((_, i) => ({
            name: `Card${i}`,
            image_uris: { normal: `https://img.normal${i}.png` },
            scryfall_uri: `https://link${i}`,
          })),
        }),
      });

    // Act
    const results = await searchScryfall("AmbiguousCard");

    // Assert
    expect(results).toHaveLength(6);
    results.forEach((r, i) => {
      expect(r).toEqual({
        name: `Card${i}`,
        imgsrc: `https://img.normal${i}.png`,
        scryfallLink: `https://link${i}`,
      });
    });
  });

  it("throws when suggestion fetch fails", async () => {
    // Arrange
    global.fetch
      .mockResolvedValueOnce({
        status: 404,
        ok: false,
        json: jest.fn().mockResolvedValue({ type: "ambiguous" }),
      })
      .mockResolvedValueOnce({
        status: 500,
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      });

    // Act & Assert
    await expect(searchScryfall("BadSuggestion")).rejects.toThrow(
      "Error fetching suggestions from Scryfall."
    );
    expect(utils.createError).toHaveBeenCalledWith(
      502,
      "Error fetching suggestions from Scryfall."
    );
  });
});
