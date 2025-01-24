const mongoose = require("mongoose");
const { Schema } = mongoose;

const listSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  totalPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  cards: [
    {
      card: { type: Schema.Types.ObjectId, ref: "Card", required: true },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
});

listSchema.pre("save", async function (next) {
  try {
    this.totalPrice = 0;
    await this.populate("cards.card");
    for (const item of this.cards) {
      const card = item.card;
      const price = card?.prices?.calc?.usd;
      if (price) {
        this.totalPrice += price * item.quantity;
      }
    }
    this.updatedAt = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

const List = mongoose.model("List", listSchema);

module.exports = { List };
