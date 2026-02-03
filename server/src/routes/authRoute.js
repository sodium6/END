const authController = require('../controllers/auth/authController.js');
const passwordResetController = require('../controllers/auth/passwordResetController.js');
const authRouter = require('express').Router();


authRouter.post("/register", authController.register);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/resend-otp", authController.resendOtp);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/profile", authController.profile);
authRouter.delete("/me", authController.deleteAccount);

authRouter.put("/profile/details", authController.updateProfileDetails);
authRouter.post("/profile/education", authController.addEducation);
authRouter.delete("/profile/education/:id", authController.deleteEducation);
authRouter.put("/profile/socials", authController.updateSocials);

authRouter.post("/requestOtp", passwordResetController.requestOtp);
authRouter.post("/verifyOtp", passwordResetController.verifyOtp);
authRouter.post("/resetPassword", passwordResetController.resetPassword);

module.exports = {
  path: 'auth',
  route: authRouter,
};
