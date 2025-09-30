import express from "express";
import {
    fetchMedia,
    fetchPreviewMedia,
    fetchAllProfileAvatar,
    fetchSingleProfileAvatar,
    fetchCustomProfileAvatar,
    fetchCommentDefaultAvatar
} from "../controllers/mediaController.js";

const mediaRouter = express.Router();

/**
 * @route GET /article/images/:uid/:image
 * @description Fetch and view article
 * @access Private
 */
mediaRouter.get("/article/images/:uid/:image", fetchMedia);

/**
 * @route GET /article/images/:articleid/:uid/:image
 * @description Fetch and view article
 * @access Private
 */
mediaRouter.get("/article/images/:uid/:articleid/:image", fetchPreviewMedia);

/**
 * @route GET /images/avatars
 * @description Fetch all avatars available
 * @access Private
 */
mediaRouter.get("/images/avatars", fetchAllProfileAvatar);

/**
 * @route GET /get/avatars/:avatarName
 * @description Fetch a single avatar
 * @access Private
 */
mediaRouter.get("/get/avatars/:avatarName", fetchSingleProfileAvatar);

/**
 * @route GET /custom/avatars/:uid/:avatarName
 * @description Fetch a user uploaded avatar
 * @access Private
 */
mediaRouter.get("/custom/avatars/:uid/:avatarName", fetchCustomProfileAvatar);

/**
 * @route GET /get/default/:avatarName
 * @description Fetch a single avatar
 * @access Private
 */
mediaRouter.get("/get/default/:avatarName", fetchCommentDefaultAvatar);

export default mediaRouter;
