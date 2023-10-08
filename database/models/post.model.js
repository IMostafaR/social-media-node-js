import mongoose from "mongoose";
import { Comment } from "./comment.model.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Post text must be at least 1 character"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privatePost: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

postSchema.post("findOneAndDelete", async function (doc) {
  const post = doc?._id;

  // Delete all comments associated with the deleted post
  await Comment.deleteMany({ post });
});

export const Post = mongoose.model("Post", postSchema);
