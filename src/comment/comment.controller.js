import { Comment } from "../../database/models/comment.model.js";
import { queryFactory } from "../utils/apiFeature/queryFactory.js";
import { AppError } from "../utils/error/appError.js";
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

/**
 * @desc update user's comment
 */

const updateComment = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;
  const { comment, text } = req.body;

  // check if the comment written by the current user and update it
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: comment, user },
    { text },
    { new: true }
  );

  // Handle cases where the post by ID is not found
  if (!updatedComment)
    return next(new AppError("Something went wrong, please try again", 404));

  // Send response
  res.status(200).json({
    status: "success",
    message: "Comment updated successfully",
    data: updatedComment,
  });
});

/**
 * @desc Like a comment
 */

const likeComment = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { id: user } = req.user;
  const { comment } = req.body;

  // Check if comment exists
  const existingComment = await Comment.findById(comment);

  if (!existingComment) return next(new AppError("Comment not found", 404));

  // Check if user has already liked this comment
  const alreadyLiked = existingComment.likes.includes(user);

  // If user has already liked this comment, unlike it

  if (alreadyLiked) {
    const unlikeComment = await Comment.findByIdAndUpdate(
      comment,
      {
        $pull: { likes: user },
      },
      { new: true }
    ).populate(populateOptions);

    // Send response
    return res.status(200).json({
      status: "success",
      message: "Comment unlike",
      likesCount: unlikeComment.likes.length,
      data: unlikeComment,
    });
  }

  // If user has not liked this comment, like it
  const likeComment = await Comment.findByIdAndUpdate(
    comment,
    {
      $addToSet: { likes: user },
    },
    { new: true }
  ).populate(populateOptions);

  // Send response
  return res.status(200).json({
    status: "success",
    message: "comment like",
    likesCount: likeComment.likes.length,
    data: likeComment,
  });
});

/**
 * @desc Get comments of a post
 */

const getPostComments = catchAsyncError(async (req, res, next) => {
  const { post } = req.body;

  // Query comments of a post
  const query = Comment.find({ post }).populate(populateOptions);

  // send query to queryFactory to apply pagination, filtering, sorting, search, and selection and send response from queryFactory
  await queryFactory(query, req, res, next);
});

/**
 * @desc delete a comment
 */
const deleteComment = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;
  const { comment } = req.body;

  // Find the user's comment by ID and delete it
  const deletedComment = await Comment.findOneAndDelete({ user, _id: comment });

  // Handle cases where the comment by ID is not found
  if (!deletedComment)
    return next(new AppError("Something went wrong, please try again", 404));

  // send response
  res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});

export {
  createComment,
  updateComment,
  likeComment,
  getPostComments,
  deleteComment,
};
