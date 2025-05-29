/**
 * Mongoose model representing magic link tokens.
 * @module Models/Token
 */

/**
 * @typedef {Object} module:Models/Token~TokenDocument
 * @property {string} email - Email address associated with the token.
 * @property {string} token - The token string.
 * @property {Date} expiresAt - Expiration date and time for the token.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a magic link token document.
 * Represents a magic link token used for authentication or verification purposes.
 */
const tokenSchema = new Schema({
  /**
   * Email address associated with the token.
   * @type {string}
   * @required
   */
  email: { type: String, required: true },

  /**
   * The token string.
   * @type {string}
   * @required
   */
  token: { type: String, required: true },

  /**
   * Expiration date and time for the token.
   * @type {Date}
   * @required
   */
  expiresAt: { type: Date, required: true },
});

/**
 * Mongoose model for the magic link token schema.
 * @type {Model<TokenDocument>}
 */
const Token = mongoose.model("Token", tokenSchema);

module.exports = { Token };
