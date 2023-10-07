import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      min: 2,
      max: 16,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      min: 2,
      max: 16,
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already registered"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password is too short"],
    },
    jobTitle: {
      type: String,
      trim: true,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    deactivated: {
      type: Boolean,
      default: false,
    },
    resetPassCode: {
      type: String,
      trim: true,
    },
    securityDate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(
      this.password,
      Number(process.env.SALT_ROUNDS)
    );
  }
});

UserSchema.pre("findOneAndUpdate" || "findByIdAndUpdate", function () {
  if (this._update.password) {
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.SALT_ROUNDS)
    );
  }
});

export const User = mongoose.model("User", UserSchema);
