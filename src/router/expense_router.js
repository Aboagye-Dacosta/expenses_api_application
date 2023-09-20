const { verifyToken } = require("../middleware/auth");
const {
  httpReadExpenses,
  httpReadExpensesById,
  httpDeleteExpenseById,
  httpSaveExpenses,
  httpUpdateExpenseById,
  httpReadExpenseSummary,
} = require("../controller/expense_controller");

const ExpensesRouter = require("express").Router();
ExpensesRouter.use(verifyToken);

ExpensesRouter.post("/", httpSaveExpenses);
ExpensesRouter.get("/", httpReadExpenses);
ExpensesRouter.get("/:id", httpReadExpensesById);

ExpensesRouter.get("/summary", httpReadExpenseSummary);

ExpensesRouter.put("/:id", httpUpdateExpenseById);
ExpensesRouter.delete("/:id", httpDeleteExpenseById);

module.exports = ExpensesRouter;
