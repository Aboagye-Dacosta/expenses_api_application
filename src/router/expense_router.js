const { verifyToken } = require("../middleware/auth");
const {
  httpReadExpenses,
  httpReadExpensesById,
  httpReadExpenseByCategory,
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
ExpensesRouter.get("/category/:category", httpReadExpenseByCategory);

ExpensesRouter.get("/summary/:params", httpReadExpenseSummary);
ExpensesRouter.get("/summary/category/:category", httpReadExpenseSummary);

ExpensesRouter.put("/:id", httpUpdateExpenseById);
ExpensesRouter.delete("/:id", httpDeleteExpenseById);

module.exports = ExpensesRouter;
