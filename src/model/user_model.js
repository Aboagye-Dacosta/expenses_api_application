const mongoose = require("mongoose");

const UserModel = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  imgUrl: { type: String },
  password: { type: String },
  createdAt: { type: String, default: Date() },
});

module.exports = mongoose.model("Users", UserModel);
