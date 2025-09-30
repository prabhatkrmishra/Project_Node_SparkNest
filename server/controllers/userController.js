/**
 * Controller for handling user-related operations.
 */

import {
  getUserByEmail,
  getUserByUsername,
  getUserDetailId,
  getUserDetailPublic,
  updateUser,
  deleteUser,
} from "../models/userModel.js";
import { verifyPassword, hashPassword } from "../services/bcryptService.js";
import { getSubscriptionByEmail, deleteSubscription } from "../models/subscriptionModel.js";
import { processAndSaveAvatarImage } from "../services/imagesServices.js";

/**
 * Check for existing email
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function checkEmailExists(req, res) {
  const { email } = req.params;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(200).json({ message: "" });
    }
    res.status(200).json({
      message: "Email already exist !",
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Check for existing username
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function checkUsernameExists(req, res) {
  const { uname } = req.params;

  try {
    const user = await getUserByUsername(uname);
    if (!user) {
      return res.status(200).json({ message: "" });
    }
    res.status(200).json({
      message: "Username already exist !",
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get user details.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getUserDetails(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to get user details" });
  }

  const { email } = req.params;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get user details for public purpose
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getUserPublic(req, res) {
  const { id } = req.params;

  try {
    const user = await getUserDetailPublic(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Update user details.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function updateUserDetails(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to update user details" });
  }

  if (!req.body.id) {
    return res
      .status(400)
      .json({ message: "Cannot update details, user ID is empty" });
  }

  const { id, ...updatedData } = req.body;
  const idnum = parseInt(id, 10);
  const {
    fname,
    lname,
    username,
    region,
    bio,
    email,
    avatar,
    oldpassword,
    password} = updatedData;
    const updatedDetails = new Map();

  if (fname) updatedDetails.set("fname", fname);
  if (lname) updatedDetails.set("lname", lname);
  if (username) updatedDetails.set("username", username);
  if (region) updatedDetails.set("region", region);
  if (bio) updatedDetails.set("bio", bio);
  if (email) updatedDetails.set("email", email);

  if (avatar) updatedDetails.set("avatar", avatar);
  if (!avatar) {
    const imageFile = req.file;
    if(imageFile) {
      const imagePath = await processAndSaveAvatarImage(
        imageFile,
        idnum,
      );
      updatedDetails.set("avatar", imagePath.avatar);
    }
  }

  if (password && oldpassword) {
    const user = await getUserDetailId(idnum);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const storedPasswordHash = user.password;
    const isMatch = await verifyPassword(oldpassword, storedPasswordHash);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Old password is incorrect, cannot update" });
    }

    const hashedNewPassword = await hashPassword(password);
    updatedDetails.set("password", hashedNewPassword);
  }

  if (updatedDetails.size === 0) {
    return res
      .status(400)
      .json({ message: "User details are empty, cannot update" });
  }

  if (updatedDetails.has("username")) {
    const checkUsernameExist = await getUserByUsername(
      updatedDetails.get("username")
    );
    if (checkUsernameExist) {
      return res
        .status(400)
        .json({ message: "Username already exists, cannot update" });
    }
  }

  if (updatedDetails.has("email")) {
    const checkEmailExist = await getUserByEmail(updatedDetails.get("email"));
    if (checkEmailExist) {
      return res
        .status(400)
        .json({ message: "Email already exists, cannot update" });
    }
  }

  try {
    const existingUser = await getUserDetailId(idnum);
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User does not exists, cannot update" });
    }

    const detailsUpdated = await updateUser(idnum, updatedDetails);
    if (detailsUpdated) {
      res.status(200).json({ message: "User details updated successfully" });
    } else {
      res.status(500).json({ message: "Cannot update user details" });
      throw "Cannot update user details";
    }
  } catch (error) {
    console.error("Error during updating user details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Delete user account.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function deleteUserAccount(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to delete user" });
  }

  const { idtodelete, email, allowed } = req.body;
  if (idtodelete && email && allowed) {
    console.log(
      `User with id:${idtodelete} has allowed to delete their account:${allowed}`
    );

    try {
      const userResult = await getUserByEmail(email);
      if (!userResult) {
        return res.status(200).json({
          message: `User with id:${idtodelete} not present in user database`,
        });
      } else {
        await deleteUser(idtodelete);
      }

      const userSubscription = getSubscriptionByEmail(email);
      if (!userSubscription) {
        return res.status(200).json({
          message: `User with id:${idtodelete} not present in subscription database`,
        });
      } else {
        await deleteSubscription(email);
      }

      return res.status(200).json({
        message: `User with id:${idtodelete} removed from database`,
      });
    } catch (error) {
      console.error("Error during account deletion:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Cannot delete, Not allowed" });
  }
}
