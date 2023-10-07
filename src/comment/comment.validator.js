import Joi from "joi";
import { mainValidationSchema } from "../middleware/validation/validation.js";

const createCommentValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
  text: mainValidationSchema.text,
});

export { createCommentValidation };
