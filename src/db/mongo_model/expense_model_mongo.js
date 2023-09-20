const mongoose = require("mongoose");

const ExpensesSchema = new mongoose.Schema({
  category: String,
  title: String,
  amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: new Date() },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Expense", ExpensesSchema);
