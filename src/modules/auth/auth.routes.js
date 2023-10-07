import { Router } from "express";
import {
  signup,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  resetPassCode,
  resetPassword,
  authenticate,
  authorize,
} from "./auth.controller.js";
import { authValidatorSchema } from "./auth.validator.js";
import { validation } from "../../middleware/validation/validation.js";

export const authRouter = Router();

// signup
authRouter.post("/signup", validation(authValidatorSchema.signup), signup);

// verify Email
authRouter.get(
  "/verifyEmail/:token",
  validation(authValidatorSchema.verifyEmail),
  verifyEmail
);

// resend Verification Email
authRouter.get("/resendEmail/:refreshToken", resendVerificationEmail);

// login

authRouter.post("/login", validation(authValidatorSchema.login), login);

// logout

authRouter.patch(
  "/logout",
  validation(authValidatorSchema.logout),
  authenticate,
  logout
);

// send reset password code
authRouter.patch(
  "/resetCode",
  validation(authValidatorSchema.resetPassCode),
  resetPassCode
);

// reset password
authRouter.patch(
  "/resetPassword",
  validation(authValidatorSchema.resetPassword),
  resetPassword
);
