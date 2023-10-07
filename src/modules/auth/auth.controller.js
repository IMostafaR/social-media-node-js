/**
 * Functions for user authentication and related operations.
 * @module authControllers
 */

import slugify from "slugify";
import { User } from "../../../database/models/user.model.js";
import { emailSender } from "../../utils/email/sendEmail.js";
import { AppError } from "../../utils/error/appError.js";
import { catchAsyncError } from "../../utils/error/asyncError.js";
import Jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

/**
 * @desc Signup a new user.
 */
const signup = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { firstName, lastName, email, password, jobTitle } = req.body;

  // Check if the email is already registered
  const existingEmail = await User.findOne({ email });

  if (existingEmail)
    return next(new AppError(`${email} already registered`, 409));

  // generate token with payload contains user's email to be sent to user's email inbox to verify their email
  const token = Jwt.sign({ email }, process.env.VERIFY_EMAIL_KEY, {
    expiresIn: 60 * 10,
  });

  // generate token with payload contains user's email to be sent to user's email inbox to ask for new token if the original token has expired
  const refreshToken = Jwt.sign({ email }, process.env.VERIFY_EMAIL_KEY);

  // email confirmation link creation with token
  const confirmationLink = `${req.protocol}://${req.headers.host}/api/v1/auth/verifyEmail/${token}`;

  // email resend link creation with token
  const resendEmailLink = `${req.protocol}://${req.headers.host}/api/v1/auth/resendEmail/${refreshToken}`;

  // email html
  const html = `<a href="${confirmationLink}" target="_blank">Verify Email</a> <br />
  <p>If the link above isn't working <a href="${resendEmailLink}" target="_blank">click here</a> to resend new confirmation email</p>`;

  // send confirmation email
  const confirmationEmail = await emailSender({
    email,
    subject: "Confirmation email",
    html,
  });

  if (!confirmationEmail)
    return next(
      new AppError(
        "Something went wrong while sending confirmation email. Please try again later",
        500
      )
    );

  // create slug
  let slug = `${firstName} ${lastName}`;
  slug = slugify(slug);

  const userData = {
    firstName,
    lastName,
    slug,
    email,
    password,
  };

  if (jobTitle) userData.jobTitle = jobTitle;

  // create new user in DB
  const newUser = await User.create(userData);

  // Send successful response
  res.status(201).json({
    status: "success",
    message:
      "Account successfully created. Please check your email to confirm your account before trying to login",
    data: newUser,
  });
});

/**
 * @desc Send email verification to user's email inbox
 */
const verifyEmail = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { token } = req.params;

  // verify token from request params
  Jwt.verify(token, process.env.VERIFY_EMAIL_KEY, async (error, decoded) => {
    if (error) return next(new AppError("Invalid token", 401));

    // Search for this email in the DB
    const existingUser = await User.findOne({ email: decoded.email });

    // Email not exist error
    if (!existingUser)
      return next(
        new AppError(
          `${decoded.email} is not registered. Please signup first`,
          404
        )
      );

    // Email is already verified error
    if (existingUser.verifiedEmail)
      return next(
        new AppError(`${decoded.email} is already verified. Please login.`, 409)
      );

    // Verify email in DB and save
    existingUser.verifiedEmail = true;
    await existingUser.save();

    // Send successful response
    res.status(200).json({
      status: "success",
      message: "Email successfully verified",
      data: existingUser,
    });
  });
});

/**
 * @desc Resend email verification to user's email inbox due to a request to resend verification email if the original token has expired
 */
const resendVerificationEmail = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { refreshToken } = req.params;

  // verify token from request params
  Jwt.verify(
    refreshToken,
    process.env.VERIFY_EMAIL_KEY,
    async (error, decoded) => {
      if (error) return next(new AppError("Invalid token", 401));

      // email confirmation link creation with token
      const token = Jwt.sign(
        { email: decoded.email },
        process.env.VERIFY_EMAIL_KEY,
        {
          expiresIn: 60 * 10,
        }
      );

      const confirmationLink = `${req.protocol}://${req.headers.host}/api/v1/auth/verifyEmail/${token}`; // main confirmation link

      const html = `<a href="${confirmationLink}" target="_blank">Verify Email</a> <br />`;

      // Send confirmation email
      await emailSender({
        email: decoded.email,
        subject: "Confirmation email",
        html,
      });

      // Send successful response
      res.status(200).json({
        status: "success",
        message: `New email sent to ${decoded.email}`,
      });
    }
  );
});

/**
 * @desc Login user with email and password and generate token for user to use it in authenticate middleware
 */
const login = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { email, password } = req.body;

  // find if user exists in DB
  const user = await User.findOne({
    email,
  });
  // check if the user verified their email
  if (user && !user.verifiedEmail)
    return next(
      new AppError(
        "You have to verify your email before trying to login. Please check your email inbox.",
        401
      )
    );

  // check if the user's account is blocked
  if (user && user.blocked)
    return next(
      new AppError("Sorry! your account is blocked. Please contact us", 403)
    );

  // check if the user's password is correct
  if (!user || !bcrypt.compareSync(password, user.password))
    return next(new AppError("Incorrect email or password", 401));

  // if all cases above didn't throw error:
  /* generate token with payload contains user's data to confirm if user authorized in authenticate middleware */
  const token = Jwt.sign(
    {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  // Send successful response
  res.status(200).json({
    status: "success",
    message: `Welcome ${user.firstName}`,
    token,
  });
});

/**
 * @desc Logout user by updating securityDate in DB to prevent user from using the token generated in login API
 */
const logout = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { id } = req.user;

  // update securityDate in DB to prevent user from using the token generated in login API
  const user = await User.findByIdAndUpdate(id, {
    securityDate: parseInt(Date.now() / 1000),
  });

  // send response
  res.status(200).json({
    status: "success",
    message: `${user.email} logged out successfully`,
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

/**
 * @desc Authenticate user by checking if the token is valid and not expired
 */
const authenticate = catchAsyncError(async (req, res, next) => {
  // Request Data
  const { token } = req.headers;

  // verify token from request headers and check if the user is exist in DB
  Jwt.verify(token, process.env.SECRET_KEY, async (error, decoded) => {
    if (error) return next(new AppError("Invalid token", 401));

    const user = await User.findById(decoded.id);

    if (!user) return next(new AppError("No such user exist", 404));

    // compare the securityDate in DB with the token's iat to check if the token is expired
    if (user.securityDate) {
      if (user.securityDate > decoded.iat)
        return next(new AppError("Forbidden. Please login first", 403));
    }
    req.user = decoded;
    next();
  });
});

/**
 *
 * @param  {...string} roles - roles to authorize
 * @returns
 */
const authorize = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(
          `Unauthorized. Only ${roles.join(" and ")} can access this API`,
          403
        )
      );
    next();
  });
};

export {
  signup,
  verifyEmail,
  resendVerificationEmail,
  login,
  logout,
  resetPassCode,
  resetPassword,
  authenticate,
  authorize,
};
