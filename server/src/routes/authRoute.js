const authController = require('../controllers/auth/authController.js');
const passwordResetController = require('../controllers/auth/passwordResetController.js');
const authRouter = require('express').Router();


authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/profile", authController.profile);

authRouter.post("/requestOtp", passwordResetController.requestOtp);
authRouter.post("/verifyOtp", passwordResetController.verifyOtp);
authRouter.post("/resetPassword", passwordResetController.resetPassword);

module.exports = {
  path: 'auth',
  route: authRouter,
};
