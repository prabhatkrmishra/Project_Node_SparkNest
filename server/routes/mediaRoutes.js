import express from "express";
import {
    fetchMedia,
    fetchPreviewMedia
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

export default mediaRouter;
