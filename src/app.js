const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const ExpensesRouter = require("./router/expense_router");
const UserRouter = require("./router/user_router");

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("api/expenses", ExpensesRouter);
app.use("api/auth", UserRouter);

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "..", "public", "index.html"));
});

module.exports = app;
