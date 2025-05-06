const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a list document.
 * Represents a user's list of cards with details and total price.
 */
const listSchema = new Schema(
  {
    /**
     * Reference to the user who owns the list.
     * @type {ObjectId}
     * @required
     */
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    /**
     * Name of the list.
     * @type {string}
     * @required
     * @maxlength 100
     */
    name: { type: String, required: true, maxlength: 100 },

    /**
     * Description of the list.
     * @type {string}
     * @required
     * @maxlength 500
     */
    description: { type: String, required: true, maxlength: 500 },

    /**
     * Total price of all cards in the list.
     * @type {number}
     * @default 0
     */
    totalPrice: { type: Number, default: 0 },

    /**
     * Array of cards in the list.
     * Each card includes a reference to the card document and its quantity.
     */
    cards: [
      {
        /**
         * Reference to the card document.
         * @type {ObjectId}
         * @required
         */
        card: { type: Schema.Types.ObjectId, ref: "Card", required: true },

        /**
         * Quantity of the card in the list.
         * @type {number}
         * @default 1
         * @minimum 1
         */
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` timestamps to the schema.
     */
    timestamps: true,
  }
);

// timestamps: true --> handles covering updatedAt on save.

/**
 * Index for efficient querying of lists by user.
 */
listSchema.index({ user: 1 });

/**
 * Mongoose model for the list schema.
 * @type {Model}
 */
const List = mongoose.model("List", listSchema);

module.exports = { List };
