const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { getDate } = require("../utils/utils");

const { generateToken } = require("../middleware/auth");
const UserModel = require("../model/user_model");
const SALT_ROUND = process.env.SALT_ROUND || 10;

const httpIsLogin = async (req, res) => {
  try {
    const user = await UserModel.findOne({ id: req.user.id });
    return res.status(200).json({
      user,
      message: "You are authorized",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

const httpLogin = async (req, res) => {
  const requiredFields = ["email", "password"];
  const missingOrEmptyFields = requiredFields.filter(
    (field) => !req.body[field]
  );

  if (missingOrEmptyFields.length === 0) {
    try {
      let user = await UserModel.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          message: "Account does not exist",
          status: false,
        });
      }

      const isValid = bcrypt.compareSync(req.body.password, user.password);

      if (!isValid) {
        return res.status(404).json({
          message: "Invalid password",
          status: false,
        });
      }

      const id = user._id;
      const token = generateToken({
        email: user.email,
        id,
      });
      user = user.toJSON();
      delete user.password;
      delete user._id;
      user["id"] = id;
      return res.status(200).json({
        message: "Login successful",
        status: true,
        token,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  }

  return res.status(400).json({
    message: "All fields are required",
    status: false,
  });
};

const httpRegister = async (req, res) => {
  const requiredFields = ["email", "password", "username"];
  const missingOrEmptyFields = requiredFields.filter((field) => {
    return !req.body.hasOwnProperty(field) || !req.body[field];
  });

  if (missingOrEmptyFields.length > 0) {
    return res.status(400).json({
      message: "All fields are required",
      status: false,
    });
  }

  try {
    const checkWetherEmailIsTaken = await UserModel.findOne({
      email: req.body.email,
    });

    if (checkWetherEmailIsTaken) {
      return res.status(400).json({
        message: "Sorry, email has already been taken",
        status: false,
      });
    }

    const salt = bcrypt.genSaltSync(Number.parseInt(SALT_ROUND));
    const hash = bcrypt.hashSync(req.body.password, salt);

    const user = {
      password: hash,
      username: req.body.username,
      email: req.body.email,
      imgUrl: "",
      createdAt: getDate(),
    };

    let result = await UserModel.create(user);
    const id = result._id;
    const token = generateToken({
      email: result.email,
      id,
    });
    result = result.toJSON();
    delete result.password;
    delete result._id;

    result["id"] = id;
    return res.status(200).json({
      user: result,
      message: "Account created successfully",
      status: true,
      token,
    });
  } catch (error)
  {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
    });
  }
};

module.exports = {
  httpIsLogin,
  httpLogin,
  httpRegister,
};
