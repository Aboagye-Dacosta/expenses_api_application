const mongoose = require("mongoose");

const ExpensesSchema = new mongoose.Schema({
  category: { type: String },
  title: { type: String },
  amount: { type: Number, default: 0 },
  createdAt: { type: String, default: Date() },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "Users" },
});

ExpensesSchema.virtual("formattedCreatedAt").get(() => {
  const { format } = require("date-fns");
  return format(this.createdAt, "yyyy-mm-dd");
});

module.exports = mongoose.model("Expenses", ExpensesSchema);
