/**
 * Mongoose model representing a card with pricing details and Scryfall metadata.
 * @module Models/Card
 */

/**
 * @typedef {Object} module:Models/Card~CardDocument
 * @property {string} name - Name of the card.
 * @property {string} scryfallLink - Scryfall link for the card.
 * @property {string} imgsrcFull - URL to the full-size image of the card.
 * @property {string} imgsrcSmall - URL to the small-size image of the card.
 * @property {Object} prices - Pricing information for the card.
 * @property {Object} prices.raw - Raw prices in various currencies.
 * @property {number} prices.raw.usd
 * @property {number} prices.raw.usd_etched
 * @property {number} prices.raw.usd_foil
 * @property {number} prices.raw.eur
 * @property {number} prices.raw.eur_etched
 * @property {number} prices.raw.eur_foil
 * @property {Object} prices.calc - Calculated prices in various currencies.
 * @property {number} prices.calc.usd
 * @property {number} prices.calc.usd_etched
 * @property {number} prices.calc.usd_foil
 * @property {number} prices.calc.eur
 * @property {number} prices.calc.eur_etched
 * @property {number} prices.calc.eur_foil
 * @property {Date} createdAt - Timestamp when the card was created.
 * @property {Date} updatedAt - Timestamp when the card was last updated.
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Mongoose schema for a card document.
 * Represents a card with its details and pricing information.
 */
const cardSchema = new Schema(
  {
    /**
     * Name of the card.
     * @type {string}
     * @required
     */
    name: { type: String, required: true },

    /**
     * Scryfall link for the card.
     * @type {string}
     * @required
     * @match /^https?:\/\/.+/
     */
    scryfallLink: { type: String, required: true, match: /^https?:\/\/.+/ },

    /**
     * Full image source URL for the card.
     * @type {string}
     * @required
     * @match /^https?:\/\/.+/
     */
    imgsrcFull: { type: String, required: true, match: /^https?:\/\/.+/ },

    /**
     * Small image source URL for the card.
     * @type {string}
     * @required
     * @match /^https?:\/\/.+/
     */
    imgsrcSmall: { type: String, required: true, match: /^https?:\/\/.+/ },

    /**
     * Pricing information for the card.
     * Contains raw and calculated prices in various currencies.
     */
    prices: {
      raw: {
        /**
         * Raw USD price.
         * @type {number}
         * @minimum 0
         */
        usd: { type: Number, min: 0 },

        /**
         * Raw USD etched price.
         * @type {number}
         * @minimum 0
         */
        usd_etched: { type: Number, min: 0 },

        /**
         * Raw USD foil price.
         * @type {number}
         * @minimum 0
         */
        usd_foil: { type: Number, min: 0 },

        /**
         * Raw EUR price.
         * @type {number}
         * @minimum 0
         */
        eur: { type: Number, min: 0 },

        /**
         * Raw EUR etched price.
         * @type {number}
         * @minimum 0
         */
        eur_etched: { type: Number, min: 0 },

        /**
         * Raw EUR foil price.
         * @type {number}
         * @minimum 0
         */
        eur_foil: { type: Number, min: 0 },
      },
      calc: {
        /**
         * Calculated USD price.
         * @type {number}
         * @minimum 0
         */
        usd: { type: Number, min: 0 },

        /**
         * Calculated USD etched price.
         * @type {number}
         * @minimum 0
         */
        usd_etched: { type: Number, min: 0 },

        /**
         * Calculated USD foil price.
         * @type {number}
         * @minimum 0
         */
        usd_foil: { type: Number, min: 0 },

        /**
         * Calculated EUR price.
         * @type {number}
         * @minimum 0
         */
        eur: { type: Number, min: 0 },

        /**
         * Calculated EUR etched price.
         * @type {number}
         * @minimum 0
         */
        eur_etched: { type: Number, min: 0 },

        /**
         * Calculated EUR foil price.
         * @type {number}
         * @minimum 0
         */
        eur_foil: { type: Number, min: 0 },
      },
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` timestamps to the schema.
     */
    timestamps: true,
  }
);

/**
 * Index for the card schema to optimize queries by card name.
 */
cardSchema.index({ name: 1 });

/**
 * Mongoose model for the card schema.
 * @type {Model<CardDocument>}
 */
const Card = mongoose.model("Card", cardSchema);

module.exports = { Card };
