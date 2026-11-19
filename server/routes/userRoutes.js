import express from "express";
import { createImageUpload } from "../middlewares/uploadMiddleware.js";
import { validate } from "../validators/validate.js";
import {
  checkEmailSchema,
  checkUsernameSchema,
  getUserDetailsSchema,
  getUserPublicSchema,
} from "../validators/user.validator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

import {
  checkEmailExists,
  checkUsernameExists,
  getUserDetails,
  getUserPublic,
  updateUserDetails,
  deleteUserAccount,
} from "../controllers/userController.js";

const userRouter = express.Router();
const upload = createImageUpload({ maxFileSize: 20 * 1024 * 1024 });

/**
 * @route GET /check/email/:email
 * @description Check if email already used
 * @access Public
 */
userRouter.get("/check/email/:email", validate(checkEmailSchema), checkEmailExists);

/**
 * @route GET /check/username/:uname
 * @description Check if username already used
 * @access Public
 */
userRouter.get("/check/username/:uname", validate(checkUsernameSchema), checkUsernameExists);

/**
 * @route GET /user/details/:email
 * @description Get details of a user by email
 * @access Private
 */
userRouter.get("/user/details/:email", requireAuth, validate(getUserDetailsSchema), getUserDetails);

/**
 * @route GET /public/user/:id
 * @description Get details of a user by id
 * @access Public
 */
userRouter.get("/public/user/:id", validate(getUserPublicSchema), getUserPublic);

/**
 * @route PATCH /user/details
 * @description Update user details
 * @access Private
 */
userRouter.patch("/user/details", requireAuth, upload.single("avatar_image"), updateUserDetails);

/**
 * @route DELETE /user/account/delete/yes
 * @description Delete user account
 * @access Private
 */
userRouter.delete("/user/account/delete/yes", requireAuth, deleteUserAccount);

export default userRouter;
