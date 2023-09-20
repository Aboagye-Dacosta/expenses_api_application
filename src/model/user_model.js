const User = require("../db/mongo_model/user_model_mongo");

const readUser = async (filter) => {
  return await User.findOne(filter);
};

const createUser = async (user) => {
  return await User.create(user);
};

const updateUser = async (user, update) => {
  return await User.findOneAndUpdate({ _id: user }, update, { new: true });
};

module.exports = {
  createUser,
  readUser,
  updateUser,
};
