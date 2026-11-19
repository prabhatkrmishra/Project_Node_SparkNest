import express from "express";
import {
  createArticle,
  viewArticle,
  fetchArticle,
  updateArticle,
  deleteArticle,
  fetchTopArticles,
} from "../controllers/articlesController.js";
import { createImageUpload } from "../middlewares/uploadMiddleware.js";
import { validate } from "../validators/validate.js";
import { articleIdSchema } from "../validators/article.validator.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const articlesRouter = express.Router();
const upload = createImageUpload({ maxFileSize: 10 * 1024 * 1024 });

/**
 * @route GET /article/view/:id
 * @description Fetch and view article, with related data
 * @access Private
 */
articlesRouter.get("/article/view/:id", validate(articleIdSchema), viewArticle);

/**
 * @route GET /article/fetch/:id
 * @description Fetch article with required data
 * @access Private
 */
articlesRouter.get("/article/fetch/:id", validate(articleIdSchema), fetchArticle);

/**
 * @route POST /article/create
 * @description Create new article
 * @access Private
 */
articlesRouter.post(
  "/article/create",
  requireAuth,
  writeLimiter,
  upload.single("preview_image"),
  createArticle
);

/**
 * @route PATCH /article/update
 * @description Update the article
 * @access Private
 */
articlesRouter.patch(
  "/article/update",
  requireAuth,
  writeLimiter,
  upload.single("updated_preview_image"),
  updateArticle
);

/**
 * @route GET /articles/top
 * @description Get the top articles by like count (for the header listing)
 * @access Public
 */
articlesRouter.get("/articles/top", fetchTopArticles);

/**
 * @route DELETE /user/details
 * @description Update user details
 * @access Private
 */
articlesRouter.delete("/article/delete", requireAuth, deleteArticle);

export default articlesRouter;
