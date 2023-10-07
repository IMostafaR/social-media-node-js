import Joi from "joi";
import { mainValidationSchema } from "../../middleware/validation/validation.js";

const createPostValidation = Joi.object({
  token: mainValidationSchema.token,
  text: mainValidationSchema.text,
  privatePost: mainValidationSchema.privatePost,
});

const updatePostValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
  text: mainValidationSchema.text,
  privatePost: mainValidationSchema.privatePost,
});

const likePostValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
});

const getPostsValidation = Joi.object({
  token: mainValidationSchema.token,
});

const deletePostsValidation = Joi.object({
  token: mainValidationSchema.token,
  post: mainValidationSchema.id,
});

export {
  createPostValidation,
  updatePostValidation,
  likePostValidation,
  getPostsValidation,
  deletePostsValidation,
};
