import { Router } from "express";
import { validation } from "../middleware/validation/validation.js";
import { createCommentValidation } from "./comment.validator.js";
import { authenticate } from "../modules/auth/auth.controller.js";
import { createComment } from "./comment.controller.js";

export const commentRouter = Router();

commentRouter
  .route("/")
  .post(validation(createCommentValidation), authenticate, createComment)
  .patch()
  .put()
  .delete();
