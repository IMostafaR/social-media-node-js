import { Comment } from "../../database/models/comment.model.js";
import { catchAsyncError } from "../utils/error/asyncError.js";

const populateOptions = {
  path: "user likes",
  select: "firstName lastName",
};
/**
 * @desc Create a new comment
 */
const createComment = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { id: user } = req.user;
  const { post, text } = req.body;

  // Create post
  const comment = await Comment.create({
    user,
    post,
    text,
  });

  // Send response
  res.status(201).json({
    status: "success",
    message: "Comment added to post successfully",
    data: comment,
  });
});

export { createComment };
