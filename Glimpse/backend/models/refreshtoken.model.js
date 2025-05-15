/**
 * @module Models/RefreshToken
 */

/**
 * @typedef {Object} module:Models/RefreshToken~RefreshTokenDocument
 * @property {string} token - The refresh token string.
 * @property {string} userId - The ID of the user associated with the token.
 * @property {Date} expiresAt - The expiration date and time for the token.
 */
const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a refresh token document.
 * Represents a refresh token used for authentication.
 */
const refreshTokenSchema = new Schema({
  /**
   * The refresh token string.
   * @type {string}
   * @required
   */
  token: { type: String, required: true, unique: true },
  /**
   * The ID of the user associated with the token.
   * @type {string}
   * @required
   */
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  /**
   * The expiration date and time for the token.
   * @type {Date}
   * @required
   */
  expiresAt: { type: Date, required: true },
});

/**
 * Mongoose model for the refresh token schema.
 * @type {Model<RefreshTokenDocument>}
 */
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = { RefreshToken };

// 'worker' to delete expired tokens periodically

// setInterval(async () => {
//   await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
// }, 60 * 60 * 1000); // Every hour
