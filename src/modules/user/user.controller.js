import slugify from "slugify";
import { User } from "../../../database/models/user.model.js";
import { AppError } from "../../utils/error/appError.js";
import { catchAsyncError } from "../../utils/error/asyncError.js";
import crypto from "crypto";
import { emailSender } from "../../utils/email/sendEmail.js";
import { queryFactory } from "../../utils/apiFeature/queryFactory.js";

/**
 * @desc Update user information based on the provided request body fields.
 */

const updateUser = catchAsyncError(async (req, res, next) => {
  // Extract data from the request
  const { id } = req.user;
  const { firstName, lastName, password, deactivated } = req.body;

  // Find the existing user by ID
  const existingUser = await User.findById(id);

  // If the user is not found, return a 404 error
  if (!existingUser)
    return next(
      new AppError(`Sorry, the user with id ${id} is not registered`, 404)
    );

  // Update the user's slug based on changes to the first name and last name
  if (firstName && lastName) {
    const slug = slugify(`${firstName} ${lastName}`);
    req.body.slug = slug;
  }

  if (firstName && !lastName) {
    const slug = slugify(`${firstName} ${existingUser.lastName}`);
    req.body.slug = slug;
  }

  if (!firstName && lastName) {
    const slug = slugify(`${existingUser.firstName} ${lastName}`);
    req.body.slug = slug;
  }

  /**Generate a new securityDate to enhance security and force users to login again
   when sensitive user information like password, or deactivation is updated */
  if (password || deactivated) {
    const securityDate = parseInt(Date.now() / 1000);
    req.body.securityDate = securityDate;
  }

  // Update the user and return the updated user data
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  // Send a success response with the updated user data
  res.status(200).json({
    status: "success",
    message: `${updatedUser.firstName}'s data updated successfully`,
    data: updatedUser,
  });
});

/**
 * @desc Get all users from DB
 */
const getAllUsers = catchAsyncError(async (req, res, next) => {
  const query = User.find({});

  // send query to queryFactory to apply pagination, filtering, sorting, search, and selection and send response from queryFactory
  await queryFactory(query, req, res, next);
});

/**
 * Get user's profile
 */
const getOneUser = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;

  const existingUser = await User.findById(user);

  if (!existingUser)
    return next(new AppError(`User with ID ${user} not found`, 404));

  // Send the response with the retrieved document
  return res.status(200).json({
    status: "success",
    data: existingUser,
  });
});

/**
 * Delete a specific user by its id from DB
 */
const deleteOneUser = catchAsyncError(async (req, res, next) => {
  const { id: user } = req.user;

  const deletedUser = await User.findByIdAndDelete(user);

  if (!deletedUser)
    return next(new AppError(`User with ID ${user} not found`, 404));

  // Send the response after successfully deleting the document
  return res.status(200).json({
    status: "success",
    message: `Your account successfully deleted`,
  });
});

/**
 * @desc Send reset password code to user's email inbox to reset their password if they forgot it
 */
const resetPassCode = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { email } = req.body;

  // find if user exists in DB
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("Account is not exist", 404));

  // generate random code and save it to DB
  const code = crypto.randomBytes(3).toString("hex");
  user.resetPassCode = code;
  await user.save();

  // send email to user with reset code
  const html = `<p>This email is sent to you upon your request to reset your password</p>
  <h1>Code: ${code}</h1>
  <p>If you did not request resetting your password, ignore this email</p>
  `;

  // send email to user with reset code
  await emailSender({
    email: user.email,
    subject: "Request to reset password",
    html,
  });

  // send response
  res.status(200).json({
    status: "success",
    message: `Reset code has been sent to ${user.email}.`,
  });
});

/**
 * @desc Reset user's password with the code sent to their email inbox
 */
const resetPassword = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { email, code, password } = req.body;

  // find if user exists in DB
  let user = await User.findOne({ email });
  if (!user) return next(new AppError("Account is not exist", 404));

  // check if the code is correct
  if (user && user.resetPassCode !== code)
    return next(new AppError("Incorrect code", 401));

  // update user's password and securityDate in DB
  const securityDate = parseInt(Date.now() / 1000);

  user = await User.findOneAndUpdate(
    { email },
    {
      password,
      securityDate,
      $unset: { resetPassCode: 1 },
    }
  );

  // send response
  return res.status(200).json({
    status: "success",
    message: `Your password has been successfully reset. Please try to login`,
  });
});

export {
  updateUser,
  getAllUsers,
  getOneUser,
  deleteOneUser,
  resetPassCode,
  resetPassword,
};
