const {
  readRangeExpenses,
  readExpensesByDay,
  readExpenseByMonth,
  createExpense,
  readExpense,
  readExpensesByMonthAndWeeks,
  readExpensesByCat,
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

const httpReadExpenses = async (req, res) => {
  let { startDate, endDate, year, month, date, weekly, today, group } =
    req.query;
  let result = [];

  try {
    if (today === "true") {
      result = await readExpensesByDay( req.user, new Date(), group);
      return res.status(200).json({
        message: "Today",
        status: true,
        expenses: result,
      });
    }

    if (date) {
      try {
        const dta = new Date(date);
        result = await readExpensesByDay(req.user, dta, group);
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
      month = date.getMonth();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0);
    } else {
      try {
        startDate = new Date(startDate);
        endDate = new Date(endDate);
        const now = Date.now();

        console.log(startDate - now);
        console.log(endDate - now);

        if (startDate - now > 0 || endDate - now > 0) {
          return res.status(401).json({
            message: "check date range",
            status: false,
          });
        }

        if (startDate - endDate > 0) {
          return res.status(401).json({
            message: "start date should not be before end date",
            status: false,
          });
        }

        endDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          23,
          59,
          59,
          999
        );

        result = await readRangeExpenses(req.user, startDate, endDate, group);
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
    result = await readExpenseByMonth(req.user, year, month, group);
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

const validateCategory = (category) => {
  const categories = ["BILLS ", "FOOD", "CLOTHING", "OTHERS", "GLOSSARY"];

  if (
    !category ||
    categories.indexOf(category.toString().toUpperCase()) === -1
  ) {
    return res.status(400).json({
      message: "malformed url",
      status: false,
    });
  }
  return category
    .substr(0, 1)
    .toUpperCase()
    .concat(category.substr(1).toLowerCase());
};

const httpReadExpenseByCategory = async (req, res) => {
  let { today, startDate, endDate, year, month, date } = req.query;
  let { category } = req.params;

  let result = [];

  if (today == "true") {
    const date = new Date();
    startDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0
    );
    endDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    );

    result = await readExpensesByCat(req.user, startDate, endDate, category);
    return res.status(200).json({
      message: "request successful",
      status: true,
      expenses: result,
    });
  }

  if (month && year) {
    const dta = new Date();
    month = Number.parseInt(month);
    year = Number.parseInt(year);

    if (month - 1 > dta.getMonth() || year > dta.getFullYear()) {
      console.log(dta.getMonth());
      return res.status(401).json({
        status: false,
        message: "malformed url string",
      });
    }

    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);

    console.log(startDate, endDate);

    result = await readExpensesByCat(req.user, startDate, endDate, category);
    return res.status(200).json({
      expenses: result,
      status: true,
      message: "successful",
    });
  }

  if (date) {
    try {
      const dta = new Date(date);

      startDate = new Date(dta.getFullYear(), dta.getMonth(), dta.getDate(), 0);
      endDate = new Date(
        dta.getFullYear(),
        dta.getMonth(),
        dta.getDate(),
        23,
        59,
        59,
        999
      );

      result = await readExpensesByCat(req.user, startDate, endDate, category);
      return res.status(200).json({
        expenses: result,
        status: true,
        message: "successful",
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "malformed url, check date format",
      });
    }
  }

  if (startDate && endDate) {
    try {
      const dta = new Date(endDate);
      startDate = new Date(startDate);
      endDate = new Date(
        dta.getFullYear(),
        dta.getMonth(),
        dta.getDate(),
        23,
        59,
        59,
        999
      );

      result = await readExpensesByCat(req.user, startDate, endDate, category);
      return res.status(200).json({
        expenses: result,
        status: true,
        message: "successful",
      });
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "malformed url, check date format",
      });
    }
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

const httpReadExpenseSummary = async (rea, res) => {
  let { today, startDate, endDate, year, month, date } = req.query;

  category = req.params;
  category = validateCategory(category);

  console.log(category);
};

module.exports = {
  httpSaveExpenses,
  httpReadExpenses,
  httpReadExpenseByCategory,
  httpReadExpenseSummary,
  httpUpdateExpenseById,
  httpDeleteExpenseById,
  httpReadExpensesById,
};
