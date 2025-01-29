const mongoose = require("mongoose");
const { Schema } = mongoose;

const listSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 500 },
  totalPrice: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, immutable: true },
  updatedAt: { type: Date, default: Date.now },
  cards: [
    {
      card: { type: Schema.Types.ObjectId, ref: "Card", required: true },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
});

// Hook for logic that happens every time the List is saved
listSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexing for efficient querying
listSchema.index({ user: 1 }); // used when querying for all lists belonging to a certain user
// listSchema.index({ "cards.card": 1 }); // used when querying for all lists containing a certain card

const List = mongoose.model("List", listSchema);

module.exports = { List };
