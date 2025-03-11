const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

const Token = mongoose.model("Token", tokenSchema);

module.exports = { Token };
