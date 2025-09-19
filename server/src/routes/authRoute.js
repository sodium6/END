const authController = require('../controllers/auth/authController.js');

const authRouter = require('express').Router();


authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/profile", authController.profile);


module.exports = {
  path: 'auth',
  route: authRouter,
};
