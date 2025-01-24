const mongoose = require("mongoose");
const { Schema } = mongoose;

const cardSchema = new Schema({
  name: { type: String, required: true },
  scryfallLink: { type: String, required: true },
  imgsrcFull: { type: String, required: true },
  imgsrcSmall: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
  prices: {
    raw: {
      usd: { type: Number },
      usd_etched: { type: Number },
      usd_foil: { type: Number },
      eur: { type: Number },
      eur_etched: { type: Number },
      eur_foil: { type: Number },
    },
    calc: {
      usd: { type: Number },
      usd_etched: { type: Number },
      usd_foil: { type: Number },
      eur: { type: Number },
      eur_etched: { type: Number },
      eur_foil: { type: Number },
    },
  },
});

cardSchema.pre("save", function (next) {
  if (this.isModified("prices")) {
    this.updatedAt = Date.now();
  }
  next();
});

const Card = mongoose.model("Card", cardSchema);

module.exports = { Card };
