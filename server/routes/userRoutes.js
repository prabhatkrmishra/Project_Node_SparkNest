import express from "express";
import {
  checkEmailExists,
  checkUsernameExists,
  getUserDetails,
  updateUserDetails,
  deleteUserAccount,
} from "../controllers/userController.js";

const userRouter = express.Router();

/**
 * @route GET /check/email/:email
 * @description Check if email already used
 * @access Private
 */
userRouter.get("/check/email/:email", checkEmailExists);

/**
 * @route GET /check/username/:uname
 * @description Check if username already used
 * @access Private
 */
userRouter.get("/check/username/:uname", checkUsernameExists);

/**
 * @route GET /user/details/:email
 * @description Get details of a user by email
 * @access Private
 */
userRouter.get("/user/details/:email", getUserDetails);

/**
 * @route PATCH /user/details
 * @description Update user details
 * @access Private
 */
userRouter.patch("/user/details", updateUserDetails);

/**
 * @route DELETE /user/account/delete/yes
 * @description Delete user account
 * @access Private
 */
userRouter.delete("/user/account/delete/yes", deleteUserAccount);

export default userRouter;
