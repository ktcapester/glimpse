const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
  },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
  lists: [{ type: Schema.Types.ObjectId, ref: "List" }],
});

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);

module.exports = { User };
