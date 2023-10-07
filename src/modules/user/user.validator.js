import Joi from "joi";
import { mainValidationSchema } from "../../middleware/validation/validation.js";

const updateUserValidation = Joi.object({
  token: mainValidationSchema.token,
  firstName: Joi.string().min(2).max(16).messages({
    "string.empty": `firstName cannot be an empty field`,
    "string.min": "firstName must be at least 2 characters long",
    "string.max": "firstName cannot be more than 16 characters long",
    "any.required": "firstName is required",
  }),
  lastName: Joi.string().min(2).max(16).messages({
    "string.empty": `lastName cannot be an empty field`,
    "string.min": "lastName must be at least 2 characters long",
    "string.max": "lastName cannot be more than 16 characters long",
    "any.required": "lastName is required",
  }),
  email: Joi.string().email({ minDomainSegments: 2 }).messages({
    "string.empty": `Email cannot be an empty field`,
    "string.email": "Invalid email",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(/^[a-zA-Z0-9]{8,30}$/)
    .messages({
      "string.empty": `Password cannot be an empty field`,
      "string.pattern.base": "Password must contain only letters and numbers",
      "any.required": "Password is required",
    }),
  deactivated: Joi.boolean().messages({
    "boolean.base": "deactivated must be true or false",
  }),
});

const getUserValidation = Joi.object({
  token: mainValidationSchema.token,
});

const deleteUserValidation = Joi.object({
  token: mainValidationSchema.token,
});

// send reset password code schema
const resetPassCodeValidation = Joi.object({
  email: mainValidationSchema.email,
});

// reset password schema
const resetPasswordValidation = Joi.object({
  email: mainValidationSchema.email,
  code: mainValidationSchema.code,
  password: mainValidationSchema.password,
  repeatPassword: mainValidationSchema.repeatPassword,
});

export {
  updateUserValidation,
  getUserValidation,
  deleteUserValidation,
  resetPassCodeValidation,
  resetPasswordValidation,
};
