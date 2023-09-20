const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: String,
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User", require: false },
});

module.exports = mongoose.model("Category", CategorySchema);
