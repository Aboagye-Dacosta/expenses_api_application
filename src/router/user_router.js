const { verifyToken } = require("../middleware/auth");
const userController = require("../controller/user_controller");

const Router = require("express").Router;

const UserRouter = Router();

UserRouter.get("/isLogin", verifyToken, userController.httpIsLogin);

UserRouter.post("/login", userController.httpLogin);

UserRouter.post("/register", userController.httpRegister);

module.exports = UserRouter;
