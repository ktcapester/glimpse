const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a token document.
 * Represents a token used for authentication or verification purposes.
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

  /**
   * Indicates whether the token has been used.
   * @type {boolean}
   * @default false
   */
  used: { type: Boolean, default: false },
});

/**
 * Mongoose model for the token schema.
 * @type {Model}
 */
const Token = mongoose.model("Token", tokenSchema);

module.exports = { Token };
