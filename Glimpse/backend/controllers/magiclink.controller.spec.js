const magicLinkService = require("../services/magiclink.service");
const { createError } = require("../utils");
const { postMagicLink, postLoginTokens } = require("./magiclink.controller");

jest.mock("../services/magiclink.service");

describe("Magic Link Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, cookies: {} };
    res = {
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postMagicLink", () => {
    it("should return successfully with valid email", async () => {
      // Arrange
      req.body.email = "foo@example.com";
      const data = { message: "Magic link sent successfully.", success: true };
      magicLinkService.sendMagicLink.mockResolvedValue();

      // Act
      await postMagicLink(req, res, next);

      // Assert
      expect(magicLinkService.sendMagicLink).toHaveBeenCalledWith(
        "foo@example.com"
      );
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should call next with no email", async () => {
      // Arrange
      req.body = {};
      const error = createError(400, "Email is required.");

      // Act
      await postMagicLink(req, res, next);

      // Assert
      expect(magicLinkService.sendMagicLink).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("postLoginTokens", () => {
    // TODO: combine these tests or make them actually test the different query params
    it("should error with no token", async () => {
      // Arrange
      req.query = {};
      const data = createError(400, "Token and email are required.");

      // Act
      await postLoginTokens(req, res, next);

      // Assert
      expect(magicLinkService.loginWithMagicLink).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(data);
    });

    it("should error with no email", async () => {
      // Arrange
      req.query = {};
      const data = createError(400, "Token and email are required.");

      // Act
      await postLoginTokens(req, res, next);

      // Assert
      expect(magicLinkService.loginWithMagicLink).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(data);
    });

    it("should return json tokens on mobile", async () => {
      // Arrange
      req.query = { token: "valid-token", email: "foo@example.com" };
      req.header = jest.fn().mockReturnValue("mobile");
      const data = { accessToken: "asdf", refreshToken: "qwer" };
      magicLinkService.loginWithMagicLink.mockResolvedValue(data);

      // Act
      await postLoginTokens(req, res, next);

      // Assert
      expect(magicLinkService.loginWithMagicLink).toHaveBeenCalledWith(
        req.query.token,
        req.query.email
      );
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should return access token and a secure cookie", async () => {
      // Arrange
      req.query = { token: "valid-token", email: "foo@example.com" };
      req.header = jest.fn().mockReturnValue(undefined);
      const data = { accessToken: "asdf", refreshToken: "qwer" };
      magicLinkService.loginWithMagicLink.mockResolvedValue(data);

      // Act
      await postLoginTokens(req, res, next);

      // Assert
      expect(magicLinkService.loginWithMagicLink).toHaveBeenCalledWith(
        "valid-token",
        "foo@example.com"
      );
      expect(res.json).toHaveBeenCalledWith({ accessToken: data.accessToken });
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        data.refreshToken,
        {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          domain: ".glimpsecard.com",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }
      );
    });
  });
});
