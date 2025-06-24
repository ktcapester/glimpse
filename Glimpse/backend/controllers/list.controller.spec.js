const listService = require("../services/list.service");
const {
  getList,
  postList,
  deleteList,
  getCard,
  patchCard,
  deleteCard,
} = require("./list.controller");

jest.mock("../services/list.service");

describe("List Controller", () => {
  let req, res, next;

  beforeEach(() => {
    // Arrange
    req = { params: {}, body: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getList", () => {
    it("should return list data on success", async () => {
      // Arrange
      req.params.listId = "list123";
      const data = { list: [], currentTotal: 0 };
      listService.getAllCards.mockResolvedValue(data);

      // Act
      await getList(req, res, next);

      // Assert
      expect(listService.getAllCards).toHaveBeenCalledWith("list123");
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.getAllCards.mockRejectedValue(error);

      // Act
      await getList(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("postList", () => {
    it("should add a card and return currentTotal with status 201 on success", async () => {
      // Arrange
      req.params.listId = "list123";
      req.body.cardId = "card456";
      const response = { currentTotal: 100 };
      listService.addCard.mockResolvedValue(response);

      // Act
      await postList(req, res, next);

      // Assert
      expect(listService.addCard).toHaveBeenCalledWith("list123", "card456");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.addCard.mockRejectedValue(error);

      // Act
      await postList(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteList", () => {
    it("should clear the list and return empty list on success", async () => {
      // Arrange
      req.params.listId = "list123";
      const response = { list: [], currentTotal: 0 };
      listService.clearList.mockResolvedValue(response);

      // Act
      await deleteList(req, res, next);

      // Assert
      expect(listService.clearList).toHaveBeenCalledWith("list123");
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.clearList.mockRejectedValue(error);

      // Act
      await deleteList(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getCard", () => {
    it("should return card data on success", async () => {
      // Arrange
      req.params.listId = "list123";
      req.params.cardId = "card456";
      const response = { list: [], quantity: 2 };
      listService.getItem.mockResolvedValue(response);

      // Act
      await getCard(req, res, next);

      // Assert
      expect(listService.getItem).toHaveBeenCalledWith("list123", "card456");
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.getItem.mockRejectedValue(error);

      // Act
      await getCard(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("patchCard", () => {
    it("should update a card and return updated list on success", async () => {
      // Arrange
      req.params.listId = "list123";
      req.params.cardId = "card456";
      req.body = { quantity: 5 };
      const response = { list: [], currentTotal: 200 };
      listService.updateItem.mockResolvedValue(response);

      // Act
      await patchCard(req, res, next);

      // Assert
      expect(listService.updateItem).toHaveBeenCalledWith(
        "list123",
        "card456",
        { quantity: 5 }
      );
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.updateItem.mockRejectedValue(error);

      // Act
      await patchCard(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteCard", () => {
    it("should remove a card and return updated list on success", async () => {
      // Arrange
      req.params.listId = "list123";
      req.params.cardId = "card456";
      const response = { list: [], currentTotal: 150 };
      listService.removeItem.mockResolvedValue(response);

      // Act
      await deleteCard(req, res, next);

      // Assert
      expect(listService.removeItem).toHaveBeenCalledWith("list123", "card456");
      expect(res.json).toHaveBeenCalledWith(response);
    });

    it("should call next with error on failure", async () => {
      // Arrange
      const error = new Error("fail");
      listService.removeItem.mockRejectedValue(error);

      // Act
      await deleteCard(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
