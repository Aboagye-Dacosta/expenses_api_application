const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  imgUrl: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("User", UserSchema);
