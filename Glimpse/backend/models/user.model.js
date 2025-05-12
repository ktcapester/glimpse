/**
 * Mongoose model representing a user account and their associated lists.
 * @module Models/User
 */

/**
 * @typedef {Object} module:Models/User~UserDocument
 * @property {string} email - Email address of the user.
 * @property {string} username - Username of the user.
 * @property {Date} createdAt - Date when the user was created.
 * @property {mongoose.Types.ObjectId[]} lists - Array of references to the user's lists.
 * @property {mongoose.Types.ObjectId} [activeList] - Reference to the user's active list.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a user document.
 * Represents a user with their email, username, and associated lists.
 */
const userSchema = new Schema({
  /**
   * Email address of the user.
   * @type {string}
   * @required
   * @unique
   * @lowercase
   * @match /^\S+@\S+\.\S+$/
   */
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },

  /**
   * Username of the user.
   * @type {string}
   * @required
   */
  username: { type: String, required: true },

  /**
   * Date when the user was created.
   * @type {Date}
   * @default Date.now
   * @immutable
   */
  createdAt: { type: Date, default: Date.now, immutable: true },

  /**
   * Array of references to the user's lists.
   * @type {ObjectId[]}
   * @ref "List"
   */
  lists: [{ type: Schema.Types.ObjectId, ref: "List" }],

  /**
   * Reference to the user's active list.
   * @type {ObjectId}
   * @ref "List"
   */
  activeList: { type: Schema.Types.ObjectId, ref: "List" },
});

/**
 * Index for efficient querying of users by username.
 */
userSchema.index({ username: 1 });

/**
 * Mongoose model for the user schema.
 * @type {Model<UserDocument>}
 */
const User = mongoose.model("User", userSchema);

module.exports = { User };
