import { Post } from "../../../database/models/post.model.js";
import { queryFactory } from "../../utils/apiFeature/queryFactory.js";
import { AppError } from "../../utils/error/appError.js";
import { catchAsyncError } from "../../utils/error/asyncError.js";

const populateOptions = {
  path: "user likes",
  select: "firstName lastName",
};
/**
 * @desc Create a new post
 */
const createPost = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { id: user } = req.user;
  const { text, privatePost } = req.body;

  // Create post
  const post = await Post.create({
    user,
    text,
    privatePost: privatePost || false,
  });

  // Send response
  res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: post,
  });
});

/**
 * @desc update user's post
 */

const updatePost = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;
  const { post, text, privatePost } = req.body;

  // check if the post written by the current user and update it
  const updatedPost = await Post.findOneAndUpdate(
    { _id: post, user },
    { text, privatePost },
    { new: true }
  );

  // Handle cases where the post by ID is not found
  if (!updatedPost)
    return next(new AppError("Something went wrong, please try again", 404));

  // Send response
  res.status(200).json({
    status: "success",
    message: "Post updated successfully",
    data: updatedPost,
  });
});

/**
 * @desc Like a post
 */

const likePost = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { id: user } = req.user;
  const { post } = req.body;

  // Check if post exists
  const existingPost = await Post.findById(post);

  if (!existingPost) return next(new AppError("Post not found", 404));

  // Check if user has already liked this post
  const alreadyLiked = existingPost.likes.includes(user);

  // If user has already liked this post, unlike it

  if (alreadyLiked) {
    const unlikePost = await Post.findByIdAndUpdate(
      post,
      {
        $pull: { likes: user },
      },
      { new: true }
    ).populate(populateOptions);

    // Send response
    return res.status(200).json({
      status: "success",
      message: "Post unlike",
      likesCount: unlikePost.likes.length,
      data: unlikePost,
    });
  }

  // If user has not liked this post, like it
  const likePost = await Post.findByIdAndUpdate(
    post,
    {
      $addToSet: { likes: user },
    },
    { new: true }
  ).populate(populateOptions);

  // Send response
  return res.status(200).json({
    status: "success",
    message: "Post like",
    likesCount: likePost.likes.length,
    data: likePost,
  });
});

/**
 * @desc Get all posts in the timeline for the logged in user
 */
const getTimeline = catchAsyncError(async (req, res, next) => {
  // Extract the current user's ID from the request
  const { id: user } = req.user;

  // Query all public posts in DB or all public and private posts if the user is the owner of the post
  const query = Post.find({
    $or: [{ privatePost: false }, { user }],
  })
    .sort({ createdAt: -1 })
    .populate(populateOptions);

  // send query to queryFactory to apply pagination, filtering, sorting, search, and selection and send response from queryFactory
  await queryFactory(query, req, res, next);
});

/**
 * @desc Get User's posts
 */
const getUserPosts = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;

  // Query all post of the current user
  const query = Post.find({ user })
    .sort({ createdAt: -1 })
    .populate(populateOptions);

  // send query to queryFactory to apply pagination, filtering, sorting, search, and selection and send response from queryFactory
  await queryFactory(query, req, res, next);
});

/**
 * @desc delete a post
 */
const deletePost = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;
  const { post } = req.body;

  // Find the user's post by ID and delete it
  const deletedPost = await Post.findOneAndDelete({ user, _id: post });

  // Handle cases where the post by ID is not found
  if (!deletedPost)
    return next(new AppError("Something went wrong, please try again", 404));

  // send response
  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

export {
  createPost,
  updatePost,
  likePost,
  getTimeline,
  getUserPosts,
  deletePost,
};
