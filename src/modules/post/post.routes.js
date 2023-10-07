import { Router } from "express";
import { validation } from "../../middleware/validation/validation.js";
import {
  createPostValidation,
  deletePostsValidation,
  getPostsValidation,
  likePostValidation,
  updatePostValidation,
} from "./post.validator.js";
import { authenticate } from "../auth/auth.controller.js";
import {
  createPost,
  updatePost,
  likePost,
  getTimeline,
  getUserPosts,
  deletePost,
} from "./post.controller.js";

export const postRouter = Router();

postRouter
  .route("/")
  .post(validation(createPostValidation), authenticate, createPost)
  .patch(validation(likePostValidation), authenticate, likePost)
  .get(validation(getPostsValidation), authenticate, getTimeline)
  .put(validation(updatePostValidation), authenticate, updatePost)
  .delete(validation(deletePostsValidation), authenticate, deletePost);

postRouter
  .route("/user")
  .get(validation(getPostsValidation), authenticate, getUserPosts);
