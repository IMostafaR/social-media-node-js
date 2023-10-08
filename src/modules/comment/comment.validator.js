import Joi from "joi";
import { mainValidationSchema } from "../../middleware/validation/validation.js";

const createCommentValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
  text: mainValidationSchema.text,
});

const updateCommentValidation = Joi.object({
  token: mainValidationSchema.token,
  comment: mainValidationSchema.id,
  text: mainValidationSchema.text,
});

const likeCommentValidation = Joi.object({
  token: mainValidationSchema.token,
  comment: mainValidationSchema.id,
});

const getPostCommentsValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
});

const deleteCommentValidation = Joi.object({
  token: mainValidationSchema.token,
  comment: mainValidationSchema.id,
});

export {
  createCommentValidation,
  updateCommentValidation,
  likeCommentValidation,
  getPostCommentsValidation,
  deleteCommentValidation,
};
