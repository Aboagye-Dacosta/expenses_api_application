const mongoose = require("mongoose");

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

const connectDB = async (PORT) => {
  try {
    await mongoose.connect(DB_CONNECTION_STRING, {
      useNewUrlParser: true,
    });
    console.log(`database connected on port ${PORT}`);
  } catch (error) {
    console.log("could not connect to db");
  }
};

module.exports = connectDB;
