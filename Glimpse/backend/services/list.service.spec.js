// Mock out the Mongoose models entirely
jest.mock("../models/card.model", () => ({
  Card: { findById: jest.fn() },
}));
jest.mock("../models/list.model", () => ({
  List: {
    findById: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

const {
  getAllCards,
  addCard,
  clearList,
  getItem,
  updateItem,
  removeItem,
} = require("./list.service");
const { Card } = require("../models/card.model");
const { List } = require("../models/list.model");

describe("List Service (unit)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllCards", () => {
    it("should return cards and total when list exists", async () => {
      // Arrange
      const mockCards = [{ card: { _id: "cid" }, quantity: 2 }];
      const mockList = { cards: mockCards, totalPrice: 42 };
      const populateMock = jest.fn().mockResolvedValue(mockList);
      List.findById.mockReturnValue({ populate: populateMock });

      // Act
      const result = await getAllCards("someListId");

      // Assert
      expect(List.findById).toHaveBeenCalledWith("someListId");
      expect(populateMock).toHaveBeenCalledWith("cards.card");
      expect(result).toEqual({ list: mockCards, currentTotal: 42 });
    });

    it("should throw 404 when list not found", async () => {
      // Arrange
      List.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(getAllCards("missing")).rejects.toMatchObject({
        status: 404,
        message: "List not found",
      });
    });
  });

  describe("addCard", () => {
    it("should add a new card and update total", async () => {
      // Arrange
      const mockCard = { _id: "cid", prices: { calc: { usd: 5 } } };
      Card.findById.mockResolvedValue(mockCard);
      const newList = { cards: [{ card: "cid", quantity: 1 }], totalPrice: 5 };
      List.findOneAndUpdate.mockResolvedValue(newList);

      // Act
      const result = await addCard("listId", "cid");

      // Assert
      expect(Card.findById).toHaveBeenCalledWith("cid");
      expect(List.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "listId", "cards.card": { $ne: mockCard._id } },
        {
          $push: { cards: { card: mockCard._id, quantity: 1 } },
          $inc: { totalPrice: 5 },
        },
        { new: true }
      );
      expect(result).toEqual({
        currentTotal: newList.totalPrice,
      });
    });

    it("should increment quantity when card already exists and update total", async () => {
      // Arrange
      const price = 7;
      const mockCard = { _id: "cid", prices: { calc: { usd: price } } };
      Card.findById.mockResolvedValue(mockCard);

      const updatedList = {
        cards: [{ card: "cid", quantity: 3 }],
        totalPrice: 21,
      };
      // First call: attempt to push a new card → returns null
      // Second call: increment existing → returns updatedList
      List.findOneAndUpdate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(updatedList);

      // Act
      const result = await addCard("listId", "cid");

      // Assert
      // 1st update: push new
      expect(List.findOneAndUpdate).toHaveBeenNthCalledWith(
        1,
        { _id: "listId", "cards.card": { $ne: mockCard._id } },
        {
          $push: { cards: { card: mockCard._id, quantity: 1 } },
          $inc: { totalPrice: price },
        },
        { new: true }
      );
      // 2nd update: increment existing
      expect(List.findOneAndUpdate).toHaveBeenNthCalledWith(
        2,
        { _id: "listId", "cards.card": mockCard._id },
        { $inc: { "cards.$.quantity": 1, totalPrice: price } },
        { new: true }
      );
      expect(result).toEqual({
        currentTotal: updatedList.totalPrice,
      });
    });

    it("should throw 404 when card not found", async () => {
      // Arrange
      Card.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(addCard("listId", "cid")).rejects.toMatchObject({
        status: 404,
        message: "Card not found",
      });
    });
  });

  describe("clearList", () => {
    it("should clear all cards and reset total", async () => {
      // Arrange
      const cleared = { cards: [], totalPrice: 0 };
      List.findByIdAndUpdate.mockResolvedValue(cleared);

      // Act
      const result = await clearList("listId");

      // Assert
      expect(List.findByIdAndUpdate).toHaveBeenCalledWith(
        "listId",
        { $set: { cards: [], totalPrice: 0 } },
        { new: true }
      );
      expect(result).toEqual({ list: [], currentTotal: 0 });
    });

    it("should throw 404 when list not found", async () => {
      // Arrange
      List.findByIdAndUpdate.mockResolvedValue(null);

      // Act & Assert
      await expect(clearList("listId")).rejects.toMatchObject({
        status: 404,
        message: "List not found",
      });
    });
  });

  describe("getItem", () => {
    it("should return the matching entry when present", async () => {
      // Arrange
      const equalsFn = jest.fn(() => true);
      const mockEntry = { card: { _id: { equals: equalsFn } }, quantity: 3 };
      const populateMock = jest.fn().mockResolvedValue({ cards: [mockEntry] });
      List.findById.mockReturnValue({ populate: populateMock });

      // Act
      const result = await getItem("listId", "cid");

      // Assert
      expect(List.findById).toHaveBeenCalledWith("listId");
      expect(result).toBe(mockEntry);
    });

    it("should throw 404 when list missing or entry not found", async () => {
      // Arrange & Act/Assert: list missing
      List.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(getItem("L", "C")).rejects.toMatchObject({
        status: 404,
        message: "List not found",
      });

      // Arrange & Act/Assert: list found but empty
      List.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ cards: [] }),
      });
      await expect(getItem("L", "C")).rejects.toMatchObject({
        status: 404,
        message: "Card not found in list",
      });
    });
  });

  describe("updateItem", () => {
    it("should return original when no updates given", async () => {
      // Arrange
      const mockCard = { _id: "cid", prices: { calc: { usd: 7 } } };
      const mockList = { cards: [], totalPrice: 0 };
      Card.findById.mockResolvedValue(mockCard);
      List.findOne.mockResolvedValue(mockList);

      // Act
      const result = await updateItem("L", "C", {});

      // Assert
      expect(List.findOne).toHaveBeenCalledWith({
        _id: "L",
        "cards.card": "C",
      });
      expect(result).toEqual({ list: [], currentTotal: 0 });
    });

    it("should throw 404 when card not in DB or list missing", async () => {
      // Arrange & Act/Assert: card missing
      Card.findById.mockResolvedValue(null);
      await expect(updateItem("L", "C", { quantity: 1 })).rejects.toMatchObject(
        { status: 404, message: "Card not found in DB" }
      );

      // Arrange & Act/Assert: list missing
      Card.findById.mockResolvedValue({
        _id: "cid",
        prices: { calc: { usd: 1 } },
      });
      List.findOne.mockResolvedValue(null);
      await expect(updateItem("L", "C", { quantity: 1 })).rejects.toMatchObject(
        { status: 404, message: "List not found" }
      );
    });

    it("should apply a quantity update and return the updated list", async () => {
      // Arrange
      const mockCard = { _id: "cid", prices: { calc: { usd: 5 } } };
      const existingEntry = {
        card: { _id: { equals: () => true } },
        quantity: 2,
      };
      const beforeList = { cards: [existingEntry], totalPrice: 10 };
      const updatedList = {
        cards: [{ ...existingEntry, quantity: 4 }],
        totalPrice: 20,
      };

      Card.findById.mockResolvedValue(mockCard);
      List.findOne.mockResolvedValue(beforeList);
      List.findOneAndUpdate.mockResolvedValue(updatedList);

      // Act
      const result = await updateItem("L", "C", { quantity: 4 });

      // Assert
      expect(List.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "L", "cards.card": "C" },
        { $set: { "cards.$.quantity": 4 }, $inc: { totalPrice: 5 * (4 - 2) } },
        { new: true }
      );
      expect(result).toEqual({
        list: updatedList.cards,
        currentTotal: updatedList.totalPrice,
      });
    });
  });

  describe("removeItem", () => {
    it("should remove a card and decrement total", async () => {
      // Arrange
      const entry = {
        card: { _id: { equals: () => true }, prices: { calc: { usd: 4 } } },
        quantity: 2,
      };
      const beforeList = { cards: [entry], totalPrice: 8 };
      const updatedList = { cards: [], totalPrice: 0 };
      const populateMock = jest.fn().mockResolvedValue(beforeList);

      List.findById.mockReturnValue({ populate: populateMock });
      List.findByIdAndUpdate.mockResolvedValue(updatedList);

      // Act
      const result = await removeItem("L", "C");

      // Assert
      expect(List.findById).toHaveBeenCalledWith("L");
      expect(List.findByIdAndUpdate).toHaveBeenCalledWith(
        "L",
        { $pull: { cards: { card: "C" } }, $inc: { totalPrice: -(2 * 4) } },
        { new: true }
      );
      expect(result).toEqual({ list: [], currentTotal: 0 });
    });

    it("should throw 404 when list or entry missing", async () => {
      // Arrange & Act/Assert: list missing
      List.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });
      await expect(removeItem("L", "C")).rejects.toMatchObject({
        status: 404,
        message: "List not found",
      });

      // Arrange & Act/Assert: entry missing
      List.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ cards: [] }),
      });
      await expect(removeItem("L", "C")).rejects.toMatchObject({
        status: 404,
        message: "Card not found in list",
      });
    });
  });
});
