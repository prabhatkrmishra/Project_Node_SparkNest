import express from "express";

import {
    getArticlePreview,
    getAllArticlePreview,
    getAllArticlePreviewCategory
} from "../controllers/articlePreviewController.js";

const articlePreviewRouter = express.Router();

/**
 * @route GET /article/previews
 * @description Fetch and view article preview
 * @access Private
 */
articlePreviewRouter.get("/article/previews", getAllArticlePreview);

/**
 * @route GET /article/preview
 * @description Fetch and view article preview
 * @access Private
 */
articlePreviewRouter.get("/article/preview/category/:category", getAllArticlePreviewCategory);

/**
 * @route GET /article/profile/preview/:id
 * @description Fetch and view user created article
 * @access Private
 */
articlePreviewRouter.get("/article/profile/preview/:id", getArticlePreview);

export default articlePreviewRouter;
