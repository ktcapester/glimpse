const mongoose = require("mongoose");
const { Schema } = mongoose;

const cardSchema = new Schema(
  {
    name: { type: String, required: true },
    scryfallLink: { type: String, required: true, match: /^https?:\/\/.+/ },
    imgsrcFull: { type: String, required: true, match: /^https?:\/\/.+/ },
    imgsrcSmall: { type: String, required: true, match: /^https?:\/\/.+/ },
    prices: {
      raw: {
        usd: { type: Number, min: 0 },
        usd_etched: { type: Number, min: 0 },
        usd_foil: { type: Number, min: 0 },
        eur: { type: Number, min: 0 },
        eur_etched: { type: Number, min: 0 },
        eur_foil: { type: Number, min: 0 },
      },
      calc: {
        usd: { type: Number, min: 0 },
        usd_etched: { type: Number, min: 0 },
        usd_foil: { type: Number, min: 0 },
        eur: { type: Number, min: 0 },
        eur_etched: { type: Number, min: 0 },
        eur_foil: { type: Number, min: 0 },
      },
    },
  },
  { timestamps: true }
);

// timestamps: true --> handles covering updatedAt on save.

// cardSchema.pre("save", function (next) {
//   if (this.isModified("prices")) {
//     this.updatedAt = Date.now();
//   }
//   next();
// });

cardSchema.index({ name: 1 });

const Card = mongoose.model("Card", cardSchema);

module.exports = { Card };
