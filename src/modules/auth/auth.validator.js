import Joi from "joi";
import { mainValidationSchema } from "../../middleware/validation/validation.js";

export const authValidatorSchema = {
  // signup schema
  signup: Joi.object({
    firstName: mainValidationSchema.firstName,
    lastName: mainValidationSchema.lastName,
    email: mainValidationSchema.email,
    password: mainValidationSchema.password,
    repeatPassword: mainValidationSchema.repeatPassword,
  }),

  // verifyEmail schema
  verifyEmail: Joi.object({
    token: mainValidationSchema.token,
  }),

  // resendVerificationEmail schema
  resendVerificationEmail: Joi.object({
    refreshToken: mainValidationSchema.token,
  }),

  //login schema
  login: Joi.object({
    email: mainValidationSchema.email,
    password: mainValidationSchema.password,
  }),

  //logout schema
  logout: Joi.object({
    token: mainValidationSchema.token,
  }),
};
