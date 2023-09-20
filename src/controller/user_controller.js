const bcrypt = require("bcrypt");

const { generateToken } = require("../middleware/auth");
const { readUser, createUser } = require("../model/user_model");
const SALT_ROUND = process.env.SALT_ROUND || 10;

const httpIsLogin = async (req, res) => {
  return res.status(200).json({
    message: "user is login",
    status: true,
  });
};

const httpLogin = async (req, res) => {
  const requiredFields = ["email", "password"];
  const missingOrEmptyFields = requiredFields.filter(
    (field) => !req.body[field]
  );

  if (missingOrEmptyFields.length === 0) {
    try {
      let user = await readUser({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          message: "Account does not exist",
          status: false,
        });
      }

      const isValid = bcrypt.compareSync(
        req.body.password.toString(),
        user.password
      );

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
      return res.status(200).json({
        message: "Login successful",
        status: true,
        token,
        user,
      });
    } catch (error) {
      console.log(error);
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

const httpLogout = async (req, res) => {}
const httpRegister = async (req, res) => {
  const requiredFields = ["email", "password", "username"];
  const missingOrEmptyFields = requiredFields.filter(
    (field) => !req.body[field]
  );

  if (missingOrEmptyFields.length > 0) {
    return res.status(400).json({
      message: "All fields are required",
      status: false,
    });
  }

  try {
    const checkWetherEmailIsTaken = await readUser({
      email: req.body.email,
    });

    if (checkWetherEmailIsTaken) {
      return res.status(400).json({
        message: "Sorry, email has already been taken",
        status: false,
      });
    }

    const salt = bcrypt.genSaltSync(Number.parseInt(SALT_ROUND));
    const hash = bcrypt.hashSync(req.body.password.toString(), salt);

    const user = {
      password: hash,
      username: req.body.username,
      email: req.body.email,
      imgUrl: "",
    };

    let result = await createUser(user);
    const token = generateToken({
      email: result.email,
      id:result._id,
    });
    result = result.toJSON();
    delete result.password;

    return res.status(200).json({
      user: result,
      message: "Account created successfully",
      status: true,
      token,
    });
  } catch (error) {
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
  httpLogout
};
