const CategoryModel = require("../db/mongo_model/expense_category_model");

const saveCategory = async (category) => {
  return await CategoryModel.create({
    name: category,
  });
};

const readCategories = async (user) => {
  return await CategoryModel.find({
    user,
  });
};

const readSingleCategory = async (user, id) => {
  return await CategoryModel.find({
    user,
    _id: id,
  });
};

module.exports = {
  saveCategory,
  readCategories,
  readSingleCategory,
};
