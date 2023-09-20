const { verifyToken } = require("../middleware/auth");
const {
  httpIsLogin,
  httpLogin,
  httpRegister,
  httpLogout,
} = require("../controller/user_controller");

const UserRouter = require("express").Router();

UserRouter.get("/is-login", verifyToken, httpIsLogin);

UserRouter.post("/login", httpLogin);
UserRouter.post("/logout", httpLogout);
UserRouter.post("/register", httpRegister);

module.exports = UserRouter;
