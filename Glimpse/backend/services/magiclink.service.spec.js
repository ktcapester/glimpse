jest.mock("crypto", () => ({
  randomBytes: jest.fn().mockReturnValue({ toString: () => "testtoken" }),
}));
jest.mock("nodemailer", () => ({
  createTransport: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));
jest.mock("uuid", () => ({
  v4: jest.fn(),
}));
jest.mock("../models/token.model", () => ({
  Token: {
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));
jest.mock("../models/user.model", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock("../models/list.model", () => ({
  List: {
    create: jest.fn(),
  },
}));
jest.mock("../models/refreshtoken.model", () => ({
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

jest.mock("../utils", () => ({
  createError: jest.fn((status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
  }),
}));

const {
  sendMagicLink,
  loginWithMagicLink,
  refreshAccessToken,
  revokeRefreshToken,
} = require("./magiclink.service");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { Token } = require("../models/token.model");
const { User } = require("../models/user.model");
const { List } = require("../models/list.model");
const { RefreshToken } = require("../models/refreshtoken.model");
const { createError } = require("../utils");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BASE_URL = "http://localhost";
  process.env.EMAIL_USER = "user@test.com";
  process.env.EMAIL_PASS = "pass";
  process.env.JWT_SECRET = "jwtsecret";
});

describe("sendMagicLink", () => {
  it("should delete old token and send new magic link", async () => {
    // Arrange
    const email = "foo@bar.com";
    Token.findOne.mockResolvedValue({ _id: "oldId" });
    const sendMail = jest.fn().mockResolvedValue();
    nodemailer.createTransport.mockReturnValue({ sendMail });
    Token.create.mockResolvedValue({
      email,
      token: "testtoken",
      expiresAt: new Date(),
    });

    // Act
    await sendMagicLink(email);

    // Assert
    expect(Token.findOne).toHaveBeenCalledWith({ email });
    expect(Token.findByIdAndDelete).toHaveBeenCalledWith("oldId");
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(Token.create).toHaveBeenCalledWith({
      email,
      token: "testtoken",
      expiresAt: expect.any(Date),
    });
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      service: "Gmail",
      auth: { user: "user@test.com", pass: "pass" },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: "user@test.com",
      to: email,
      subject: "Your Magic Link",
      text: `Click here to log in: http://localhost/verify?token=testtoken&email=${encodeURIComponent(
        email
      )}`,
      html: `<a href="http://localhost/verify?token=testtoken&email=${encodeURIComponent(
        email
      )}">Log in</a>`,
    });
  });

  it("should send magic link when no existing token", async () => {
    // Arrange
    const email = "new@user.com";
    Token.findOne.mockResolvedValue(null);
    const sendMail = jest.fn().mockResolvedValue();
    nodemailer.createTransport.mockReturnValue({ sendMail });
    Token.create.mockResolvedValue({
      email,
      token: "testtoken",
      expiresAt: new Date(),
    });

    // Act
    await sendMagicLink(email);

    // Assert
    expect(Token.findOne).toHaveBeenCalledWith({ email });
    expect(Token.findByIdAndDelete).not.toHaveBeenCalled();
    expect(Token.create).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalled();
  });
});

describe("loginWithMagicLink", () => {
  it("should throw if magic link is invalid or expired", async () => {
    // Arrange
    Token.findOneAndDelete.mockResolvedValue(null);

    // Act & Assert
    await expect(loginWithMagicLink("tok", "a@b.com")).rejects.toThrow(
      "Invalid or expired magic link."
    );
    expect(createError).toHaveBeenCalledWith(
      400,
      "Invalid or expired magic link."
    );
  });

  it("should log in existing user and return tokens", async () => {
    // Arrange
    Token.findOneAndDelete.mockResolvedValue({
      email: "u@u.com",
      token: "tok",
      expiresAt: Date.now(),
    });
    const existingUser = { _id: "user1", save: jest.fn() };
    User.findOne.mockResolvedValue(existingUser);
    jwt.sign.mockReturnValue("access-token");
    uuidv4.mockReturnValue("refresh-uuid");
    RefreshToken.create.mockResolvedValue();

    // Act
    const result = await loginWithMagicLink("tok", "u@u.com");

    // Assert
    expect(User.findOne).toHaveBeenCalledWith({ email: "u@u.com" });
    expect(jwt.sign).toHaveBeenCalledWith({ userId: "user1" }, "jwtsecret", {
      expiresIn: "15m",
    });
    expect(RefreshToken.create).toHaveBeenCalledWith({
      token: "refresh-uuid",
      userId: "user1",
      expiresAt: expect.any(Date),
    });
    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-uuid",
    });
  });

  it("should create new user, default list, and return tokens", async () => {
    // Arrange
    Token.findOneAndDelete.mockResolvedValue({
      email: "new@u.com",
      token: "tok",
      expiresAt: Date.now(),
    });
    User.findOne.mockResolvedValue(null);
    const newUser = {
      _id: "nu1",
      lists: [],
      activeList: null,
      save: jest.fn(),
    };
    User.create.mockResolvedValue(newUser);
    List.create.mockResolvedValue({ _id: "list1" });
    jwt.sign.mockReturnValue("a-token");
    uuidv4.mockReturnValue("r-token");
    RefreshToken.create.mockResolvedValue();

    // Act
    const result = await loginWithMagicLink("tok", "new@u.com");

    // Assert
    expect(User.create).toHaveBeenCalledWith({
      email: "new@u.com",
      username: "new",
    });
    expect(List.create).toHaveBeenCalledWith({
      user: "nu1",
      name: "new Default List",
      description: "new's auto generated list.",
    });
    expect(newUser.lists).toEqual(["list1"]);
    expect(newUser.activeList).toBe("list1");
    expect(newUser.save).toHaveBeenCalled();
    expect(result).toEqual({
      accessToken: "a-token",
      refreshToken: "r-token",
    });
  });
});

describe("refreshAccessToken", () => {
  it("should throw if refresh token is invalid", async () => {
    // Arrange
    RefreshToken.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(refreshAccessToken("bad")).rejects.toThrow(
      "Invalid refresh token."
    );
    expect(createError).toHaveBeenCalledWith(401, "Invalid refresh token.");
  });

  it("should throw if refresh token has expired", async () => {
    // Arrange
    const past = new Date(Date.now() - 1000);
    RefreshToken.findOne.mockResolvedValue({ userId: "u", expiresAt: past });

    // Act & Assert
    await expect(refreshAccessToken("bad")).rejects.toThrow(
      "Refresh token has expired."
    );
    expect(createError).toHaveBeenCalledWith(401, "Refresh token has expired.");
  });

  it("should return a new access token for a valid refresh token", async () => {
    // Arrange
    const future = new Date(Date.now() + 100000);
    RefreshToken.findOne.mockResolvedValue({ userId: "u2", expiresAt: future });
    jwt.sign.mockReturnValue("new-access");

    // Act
    const token = await refreshAccessToken("good");

    // Assert
    expect(jwt.sign).toHaveBeenCalledWith({ userId: "u2" }, "jwtsecret", {
      expiresIn: "15m",
    });
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
