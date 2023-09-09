const { verifyToken } = require("../middleware/auth");
const {
  httpReadExpenses,
  httpSaveExpenses,
} = require("../controller/expense_controller");

const Router = require("express").Router;

const ExpensesRouter = Router();
ExpensesRouter.use(verifyToken);

ExpensesRouter.post("/save", httpSaveExpenses);

ExpensesRouter.get("/:id", (req, res) => {
  res.send("Hello");
});

ExpensesRouter.get("/", httpReadExpenses);

module.exports = ExpensesRouter;
