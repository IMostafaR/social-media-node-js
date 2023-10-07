import { Router } from "express";
import { validation } from "../../middleware/validation/validation.js";
import {
  deleteUserValidation,
  getUserValidation,
  resetPassCodeValidation,
  resetPasswordValidation,
  updateUserValidation,
} from "./user.validator.js";
import {
  deleteOneUser,
  getAllUsers,
  getOneUser,
  resetPassCode,
  resetPassword,
  updateUser,
} from "./user.controller.js";
import { authenticate, authorize } from "../auth/auth.controller.js";

export const userRouter = Router();

userRouter
  .route("/")
  .get(
    validation(getUserValidation),
    authenticate,
    authorize("admin"),
    getAllUsers
  )
  .put(validation(updateUserValidation), authenticate, updateUser)
  .delete(validation(deleteUserValidation), authenticate, deleteOneUser);

userRouter
  .route("/profile")
  .get(validation(getUserValidation), authenticate, getOneUser);

// send reset password code
userRouter.patch(
  "/resetCode",
  validation(resetPassCodeValidation),
  resetPassCode
);

// reset password
userRouter.patch(
  "/resetPassword",
  validation(resetPasswordValidation),
  resetPassword
);
