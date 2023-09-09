const { getDate } = require("../utils/utils");
const ExpenseModel = require("../model/expenses_model");

const readExpensesByDay = async (req) => {
  return await ExpenseModel.find({
    user: req.user.id,
    formattedCreatedAt: getDate(),
  });
};

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
    return res.status(401).json({
      message: "All fields are required",
      status: false,
    });
  }

  const expense = {
    ...req.body,
    createdAt: getDate(),
    user: req.user.id,
  };

  try {
    const result = await ExpenseModel.create(expense);
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

const httpReadExpenses = async (req, res) => {
  const { year, month, week, today } = req.query;
  let result = [];

  if (today === "true") {
    try {
      result = readExpensesByDay(req);
      return res.status(200).json({
        message: "Today",
        status: true,
        expenses: result,
      });
    } catch (error) {
      return serverError(res);
    }
  }

  if (!year || !month) {
    return res.status(401).json({
      message: "Check request URL",
      status: false,
    });
  }

  let filterByWeek = year && month && week;

  if (filterByWeek) {
    return res.status(200).json({
      message: "Week",
      status: true,
    });
  }

  return res.status(200).json({
    message: "Authorized",
    status: true,
  });
};

const readSingleExpense = async () => {};

module.exports = {
  httpSaveExpenses,
  httpReadExpenses,
  readSingleExpense,
};
