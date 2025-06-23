const jwt = require("jsonwebtoken");
const authenticateJWT = require("./authJWT.middle");

jest.mock("jsonwebtoken");

describe("authenticateJWT middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Arrange (common)
    process.env.JWT_SECRET = "test-secret";
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jwt.verify.mockReset();
  });

  it("responds 401 if no Authorization header is provided", () => {
    // Arrange: handled in beforeEach

    // Act
    authenticateJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: no token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 if Authorization header does not start with Bearer", () => {
    // Arrange (override req.header)
    req.headers.authorization = "Token abc";

    // Act
    authenticateJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: no token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 and 'Access token expired' if token has expired", () => {
    // Arrange
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";
    jwt.verify.mockImplementation(() => {
      throw expiredError;
    });
    req.headers.authorization = "Bearer someExpiredToken";

    // Act
    authenticateJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Access token expired",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("responds 401 and 'Invalid access token' if token is invalid", () => {
    // Arrange
    const invalidError = new Error("invalid signature");
    invalidError.name = "JsonWebTokenError";
    jwt.verify.mockImplementation(() => {
      throw invalidError;
    });
    req.headers.authorization = "Bearer someInvalidToken";

    // Act
    authenticateJWT(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid access token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and attaches userId when token is valid", () => {
    // Arrange
    const payload = { userId: "12345" };
    jwt.verify.mockReturnValue(payload);
    req.headers.authorization = "Bearer validToken";

    // Act
    authenticateJWT(req, res, next);

    // Assert
    expect(req.userId).toBe("12345");
    expect(next).toHaveBeenCalled();
  });
});
