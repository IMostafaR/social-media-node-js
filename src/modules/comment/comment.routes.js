import { Router } from "express";
import { validation } from "../../middleware/validation/validation.js";
import { authenticate } from "../auth/auth.controller.js";
import {
  createCommentValidation,
  deleteCommentValidation,
  getPostCommentsValidation,
  likeCommentValidation,
  updateCommentValidation,
} from "./comment.validator.js";
import {
  createComment,
  deleteComment,
  getPostComments,
  likeComment,
  updateComment,
} from "./comment.controller.js";

export const commentRouter = Router();

commentRouter
  .route("/")
  .post(validation(createCommentValidation), authenticate, createComment)
  .get(validation(getPostCommentsValidation), authenticate, getPostComments)
  .patch(validation(likeCommentValidation), authenticate, likeComment)
  .put(validation(updateCommentValidation), authenticate, updateComment)
  .delete(validation(deleteCommentValidation), authenticate, deleteComment);
