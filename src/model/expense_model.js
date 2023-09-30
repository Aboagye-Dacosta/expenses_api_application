const { Types } = require("mongoose");
const Expense = require("../db/mongo_model/expense_model_mongo");
const { getRounds } = require("bcrypt");

const groupFilter = {
  $group: {
    _id: "$category",
    totalExpense: { $sum: "$amount" },
    expenses: {
      $push: {
        title: "$title",
        _id: "$_id",
        amount: "$amount",
        category: "$category",
        createdAt: "$createdAt",
      },
    },
  },
};

const readExpensesByDay = async (user, date, group) => {
  // Set the start and end of the current day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const aggregation = [
    {
      $match: {
        user: new Types.ObjectId(user),
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
  ];

  if (group == "true") {
    aggregation.push(groupFilter);
  }

  return await Expense.aggregate(aggregation).exec();
};

const readExpenseByMonth = async (user, year, month, group) => {
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const aggregation = [
    {
      $match: {
        user: new Types.ObjectId(user),
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
  ];

  if (group == "true") {
    aggregation.push(groupFilter);
  }

  return await Expense.aggregate([
    ...aggregation,
    {
      $sort: { "expenses.createdAt": 1 },
    },
  ]).exec();
};

const createExpense = async (expense) => {
  return await Expense.create(expense);
};

const readRangeExpenses = async (user, startDate, endDate, group) => {
  const aggregation = [
    {
      $match: {
        user: new Types.ObjectId(user),
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
  ];

  if (group === "true") {
    aggregation.push(groupFilter);
  }

  return await Expense.aggregate(aggregation).exec();
};

const readExpensesByMonthAndWeeks = async (user, startDate, endDate, group) => {
  // const startDate = new Date(year, month, 1); // Month is 0-based
  // const endDate = new Date(year, month + 1, 0);

  const expenses = await Expense.find({
    user: user,
    createdAt: {
      $gte: startDate,
      $lt: endDate,
    },
  });

  console.log(expenses);

  const groupedExpenses = {};

  expenses.forEach((expense) => {
    const weekNumber = getWeekNumberInMonth(expense.createdAt, startDate);
    const category = expense.category;

    console.log(weekNumber, category);

    if (group == "true") {
      if (!groupedExpenses[weekNumber]) {
        groupedExpenses[weekNumber] = {};
      }

      if (!groupedExpenses[weekNumber][category]) {
        groupedExpenses[weekNumber][category] = [];
      }

      groupedExpenses[weekNumber][category].push(expense);
    } else {
      console.log("----------------------❤️❤️❤️❤️ entered here");
      if (!groupedExpenses[`${weekNumber}`]) {
        groupedExpenses[`${weekNumber}`] = [];
      }

      groupedExpenses[`${weekNumber}`].push(expense);
      console.log(groupedExpenses);
    }
  });

  return groupedExpenses;
};

const readExpensesByCat = async (user, startDate, endDate, category) => {
  return await Expense.find({
    user: user,
    category: category,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });
};

// Function to calculate the week number within the selected month
function getWeekNumberInMonth(date, monthStartDate) {
  const days = Math.floor((date - monthStartDate) / 86400000); // Calculate the day difference
  const weekNumber = Math.ceil((days + monthStartDate.getDay() + 1) / 7);
  return weekNumber;
}

const readExpense = async (user, filter) => {
  return await Expense.findOne({
    user: user,
    ...filter,
  });
};

const updateExpense = async (user, id, data) => {
  return await Expense.findOneAndUpdate(
    {
      user,
      _id: id,
    },
    data,
    { new: true }
  );
};

const expensesSummary = async (user, startDate, endDate) => {
  return await Expense.aggregate([
    {
      $match: {
        user: new Types.ObjectId(user),
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$category",
        totalExpenses: {
          $sum: "$amount",
        },
      },
    },
  ]).exec();
};

module.exports = {
  readRangeExpenses,
  readExpensesByDay,
  readExpenseByMonth,
  readExpensesByMonthAndWeeks,
  readExpensesByMonthAndWeeks,
  createExpense,
  readExpense,
  updateExpense,
  readExpensesByCat,
};
