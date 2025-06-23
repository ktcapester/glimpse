const { calculatePriceFromName } = require("./price.service");
const { Card } = require("../models/card.model");

// Mock the Card model methods
jest.mock("../models/card.model", () => ({
  Card: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock utility functions to avoid real delays and errors
jest.mock("../utils", () => ({
  delay: jest.fn(() => Promise.resolve()),
  headers: {},
  scryfallCardAPIBase: "https://api.scryfall.com/cards",
  createError: (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
  },
}));

describe("calculatePriceFromName", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("should throw a 400 error if cardName is not provided", async () => {
    // Arrange
    const emptyName = "";
    // Act & Assert
    await expect(calculatePriceFromName(emptyName)).rejects.toMatchObject({
      message: "Card name is required.",
      status: 400,
    });
  });

  it("should throw a 404 error when Scryfall returns 404", async () => {
    // Arrange
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    // Act & Assert
    await expect(calculatePriceFromName("Nonexistent")).rejects.toMatchObject({
      message: "Card Nonexistent not found.",
      status: 404,
    });
  });

  it("should throw a 502 error when Scryfall returns other errors", async () => {
    // Arrange
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 });
    // Act & Assert
    await expect(calculatePriceFromName("AnyCard")).rejects.toMatchObject({
      message: "Error fetching card data from Scryfall.",
      status: 502,
    });
  });

  it("should create a new card in DB if not found", async () => {
    // Arrange
    const fakeScryfallData = {
      name: "TestCard",
      scryfall_uri: "https://scryfall.test/card",
      image_uris: { large: "large.jpg", normal: "normal.jpg" },
      prices: {
        usd: "1.23",
        usd_etched: "0.12",
        usd_foil: "2.34",
        eur: "0.45",
        eur_etched: "0.05",
        eur_foil: "0.67",
      },
      prints_search_uri: "https://scryfall.test/prints",
    };
    const fakeCalcPrices = {
      usd: 0,
      usd_etched: 0,
      usd_foil: 0,
      eur: 0,
      eur_etched: 0,
      eur_foil: 0,
    };
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(fakeScryfallData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      });
    Card.findOne.mockResolvedValue(null);
    const rawPrices = {
      usd: parseFloat(fakeScryfallData.prices.usd),
      usd_etched: parseFloat(fakeScryfallData.prices.usd_etched),
      usd_foil: parseFloat(fakeScryfallData.prices.usd_foil),
      eur: parseFloat(fakeScryfallData.prices.eur),
      eur_etched: parseFloat(fakeScryfallData.prices.eur_etched),
      eur_foil: parseFloat(fakeScryfallData.prices.eur_foil),
    };
    const createdCard = {
      id: "1",
      name: fakeScryfallData.name,
      scryfallLink: fakeScryfallData.scryfall_uri,
      imgsrcFull: fakeScryfallData.image_uris.large,
      imgsrcSmall: fakeScryfallData.image_uris.normal,
      prices: { raw: rawPrices, calc: fakeCalcPrices },
    };
    Card.create.mockResolvedValue(createdCard);

    // Act
    const result = await calculatePriceFromName("TestCard");

    // Assert
    expect(Card.create).toHaveBeenCalledWith({
      name: fakeScryfallData.name,
      scryfallLink: fakeScryfallData.scryfall_uri,
      imgsrcFull: fakeScryfallData.image_uris.large,
      imgsrcSmall: fakeScryfallData.image_uris.normal,
      prices: { raw: rawPrices, calc: fakeCalcPrices },
    });
    expect(result).toBe(createdCard);
  });

  it("should update existing card in DB if found", async () => {
    // Arrange
    const fakeScryfallData = {
      name: "TestCard",
      scryfall_uri: "https://scryfall.test/card",
      image_uris: { large: "large.jpg", normal: "normal.jpg" },
      prices: {
        usd: "1.23",
        usd_etched: "0.12",
        usd_foil: "2.34",
        eur: "0.45",
        eur_etched: "0.05",
        eur_foil: "0.67",
      },
      prints_search_uri: "https://scryfall.test/prints",
    };
    const fakeCalcPrices = {
      usd: 0,
      usd_etched: 0,
      usd_foil: 0,
      eur: 0,
      eur_etched: 0,
      eur_foil: 0,
    };
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(fakeScryfallData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      });
    const foundDoc = { save: jest.fn(), prices: { raw: {}, calc: {} } };
    Card.findOne.mockResolvedValue(foundDoc);
    const updatedDoc = { ...foundDoc, updated: true };
    foundDoc.save.mockResolvedValue(updatedDoc);

    // Act
    const result = await calculatePriceFromName("TestCard");

    // Assert
    expect(foundDoc.prices.raw).toEqual({
      usd: parseFloat(fakeScryfallData.prices.usd),
      usd_etched: parseFloat(fakeScryfallData.prices.usd_etched),
      usd_foil: parseFloat(fakeScryfallData.prices.usd_foil),
      eur: parseFloat(fakeScryfallData.prices.eur),
      eur_etched: parseFloat(fakeScryfallData.prices.eur_etched),
      eur_foil: parseFloat(fakeScryfallData.prices.eur_foil),
    });
    expect(foundDoc.prices.calc).toEqual(fakeCalcPrices);
    expect(foundDoc.save).toHaveBeenCalled();
    expect(result).toBe(updatedDoc);
  });
});
