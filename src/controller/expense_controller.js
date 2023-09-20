const {
  readRangeExpenses,
  readExpensesByDay,
  readExpenseByMonth,
  createExpense,
  readExpense,
  readExpensesByMonthAndWeeks,
  updateExpense,
} = require("../model/expense_model");

const serverError = (res) =>
  res.status(500).json({
    status: false,
    message: "internal server error",
  });

const httpSaveExpenses = async (req, res) => {
  const requiredParameters = ["category", "title", "amount"];
  const missingOrEmptyFields = requiredParameters.filter(
    (param) => !req.body[param]
  );

  if (missingOrEmptyFields.length > 0) {
    return res.status(400).json({
      message: "All fields are required",
      status: false,
    });
  }

  const expense = {
    user: req.user,
    amount: req.body["amount"],
    category: req.body["category"],
    title: req.body["title"],
  };

  try {
    let result = await createExpense(expense);
    return res.status(200).json({
      status: true,
      message: "Expenses added successfully",
      expenses: result,
    });
  } catch (error) {
    console.log(error);
    return serverError(res);
  }
};

//NB: calculate the grand total expenses.

// const grandTotalExpenses = () =>
// {

// }

//NB: read expenses from the database applying filters

const httpReadExpenses = async (req, res) => {
  let { startDate, endDate, year, month, date, weekly, today, group } =
    req.query;
  let result = [];

  try {
    if (today === "true") {
      result = await readExpensesByDay(req.user, new Date(), group);
      return res.status(200).json({
        message: "Today",
        status: true,
        expenses: result,
      });
    }

    if (date) {
      try {
        const dta = new Date(date);
        const result = await readExpensesByDay(req.user, dta, group);
        return res.status(200).json({
          message: "successful",
          status: true,
          expenses: result,
        });
      } catch (error) {
        return res.status(401).json({
          message: "bad request",
          status: false,
        });
      }
    }

    if (!startDate || !endDate) {
      const date = new Date();
      year = date.getFullYear();
      month = date.month();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else {
      try {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        const now = Date.now();
        if (now - startDate > 0 || now - endDate > 0) {
          return res.status(401).json({
            message: "bad request",
            status: false,
          });
        }

        const result = await readRangeExpenses(
          req.user,
          startDate,
          endDate,
          group
        );
        return res.status(200).json({
          expenses: result,
          message: "successful",
          status: true,
        });
      } catch (error) {
        return res.status(401).json({
          message: "bad request",
          status: false,
        });
      }
    }

    if (weekly === "true") {
      result = await readExpensesByMonthAndWeeks(
        req.user,
        startDate,
        endDate,
        group
      );

      return res.status(200).json({
        expenses: result,
        message: "Week",
        status: true,
      });
    }

    let grandTotalExpenses;
    result = await readExpenseByMonth(req.user, startDate, endDate, group);
    if (group == "true") {
      grandTotalExpenses = result.reduce(
        (prev, cur) => prev + cur.totalExpense,
        0
      );
    }

    return res.status(200).json({
      expenses: result,
      message: "Authorized",
      status: true,
      grandTotalExpenses,
    });
  } catch (error) {
    console.log(error);
    return serverError(res);
  }
};

const httpReadExpenseByCategory = async (req, res) => {
  let { today, month, year, day, category } = req.query;
  let result = [];
  const categories = ["Bills", "Food", "Clothing", "Others", "Glossary"];

  if (
    !category ||
    categories.indexOf(
      category.toString().substr(0, 1).toUpperCase().join(category.substr(1))
    ) === -1
  ) {
    return res.status(400).json({
      message: "malformed url",
      status: false,
    });
  }

  if (today == "true") {
    result = await readExpensesByDayAndCat(req.user, new Date(), category);
    return res.status(200).json({
      message: "request successful",
      status: true,
      expenses: result,
    });
  }

  if (!month || !year) {
  }
};

const httpReadExpensesById = async (req, res) => {
  const { id } = req.param;

  if (!id) {
    return res.status(400).json({
      message: "malformed url",
      status: false,
    });
  }

  const expenses = await readExpense(req.user, { _id: id });
  return res.status(200).json({
    message: "request successful",
    status: true,
    expenses,
  });
};

const httpUpdateExpenseById = async (req, res) => {
  const { id } = req.param;
  if (!id) {
    return res.status(400).json({
      message: "bad request",
      status: false,
    });
  }

  const data = req.body;

  try {
    const result = await updateExpense(req.user, id, data);
    return res.status(200).json({
      message: "updated successfully",
      status: true,
      expenses: result,
    });
  } catch (error) {
    serverError(res);
  }
};

const httpDeleteExpenseById = async (req, res) => {
  const { id } = req.param;
  const user = req.user;

  if (!id) {
    return res.status(400).json({
      message: "bad request",
      status: false,
    });
  }

  try {
    const result = await deleteExpense(user, id);
    return res.status(200).json({
      message: "expense deleted successful",
      status: true,
      expense: result,
    });
  } catch (error) {
    serverError(res);
  }
};

const httpReadExpenseSummary = async (rea, res) => {};

module.exports = {
  httpSaveExpenses,
  httpReadExpenses,
  httpReadExpenseByCategory,
  httpReadExpenseSummary,
  httpUpdateExpenseById,
  httpDeleteExpenseById,
  httpReadExpensesById,
};
