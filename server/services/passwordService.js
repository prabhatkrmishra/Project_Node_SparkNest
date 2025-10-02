import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import config from "../config/config.js";

import { getUserByEmail } from "../models/userModel.js";
import {
  storeResetCredentials,
  verifyToken,
  updateResetPassword,
} from "../models/passwordResetModel.js";

import { hashPassword } from "./bcryptService.js";

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.serviceEmail,
    pass: config.servicePass,
  },
});

/**
 * Get email from request send password reset email
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const sendResetEmail = async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({
      error: "Cannot generate link, email is empty",
    });
  }

  const token = uuidv4();
  const expires = new Date(Date.now() + 3600000);
  const resetUrl = `${config.allowedOrigins}/password/reset/${email}/${token}`;

  try {
    const result = await getUserByEmail(email);
    if (!result) {
      return res.status(200).json({
        message:
          "If an account with this email exists, a password reset link has been sent. Check your email inbox/spam folder",
      });
    }

    const store = await storeResetCredentials(email, token, expires);
    if (!store) {
      return res.status(500).json({
        message: "Something went wrong during generating reset token",
      });
    }

    const mailOptions = {
      from: `${config.serviceEmail}`,
      to: `${email}`,
      subject: "Password Reset link for SparkNest",
      text: `You requested a password reset. \nClick the following link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset. \nClick the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message:
        "If an account with this email exists, a password reset link has been sent. Check your email inbox/spam folder",
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({
      error: "There was an internal error. Please try again later.",
    });
  }
};

/**
 * Get request token and verify it
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const verifyResetToken = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({
      message: `Unable to verify your password reset request. It seems either
        the email address or reset link is missing. Please make sure you have
        clicked the correct link from your email or request a new password reset.`,
    });
  }

  try {
    const verify = await verifyToken(email, token);
    if (!verify) {
      return res.status(400).json({
        message:
          "Your password reset link has expired. To reset your password, please request a new reset link.",
      });
    }

    return res.status(200).json({
      message:
        "Your password reset link is active. Please enter your new password below to reset it.",
    });
  } catch (error) {
    console.error("Error in verifying password reset request:", error);
    res.status(500).json({
      error: "There was an internal error. Please try again later.",
    });
  }
};

/**
 * Update user password if reset token is valid
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const updateNewPasswords = async (req, res) => {
  const { newPassword, confirmPassword, email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({
      message: `Unable to update your password. It seems that the email address or token
        is missing. Please provide all required fields.`,
    });
  }

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      message: `Unable to update your password. It seems that the new password, 
        confirmation password is missing. Please provide all required fields.`,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      message: `The new password and confirmation password do not match. 
        Please ensure both fields are identical.`,
    });
  }

  try {
    const result = await getUserByEmail(email);
    if (!result) {
      return res.status(400).json({
        message: "User email or token is wrong, cannot update",
      });
    }

    const verify = await verifyToken(email, token);
    if (!verify) {
      return res.status(400).json({
        message: "Email or token is wrong, cannot update",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updateResult = await updateResetPassword(email, hashedPassword);
    if (!updateResult) {
      return res.status(400).json({
        message:
          "There was an error updating your password. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "Your password has been updated successfully.",
    });
  } catch (error) {
    console.error("Error in updating password:", error);
    return res.status(500).json({
      error: "There was an internal error. Please try again later.",
    });
  }
};
