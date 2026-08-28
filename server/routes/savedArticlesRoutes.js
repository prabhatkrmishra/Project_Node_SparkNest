import express from "express";
import {
  isSavedArticle,
  saveArticle,
  unsaveArticle,
  fetchSavedArticles,
} from "../controllers/savedArticlesController.js";
import { validate } from "../validators/validate.js";
import { checkSavedSchema, saveArticleSchema, fetchSavedSchema } from "../validators/saved.validator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const savedArticlesRouter = express.Router();

/**
 * @route GET /articles/checksaved/:userId/:articleId
 * @description Check if a user has saved a specific article
 * @access Public
 */
savedArticlesRouter.get("/articles/checksaved/:userId/:articleId", validate(checkSavedSchema), isSavedArticle);

/**
 * @route POST /articles/save
 * @description Save an article for the user
 * @access Private
 */
savedArticlesRouter.post("/articles/save", requireAuth, validate(saveArticleSchema), saveArticle);

/**
 * @route POST /articles/unsave
 * @description Unsave an article for the user
 * @access Private
 */
savedArticlesRouter.post("/articles/unsave", requireAuth, validate(saveArticleSchema), unsaveArticle);

/**
 * @route GET /articles/saved/:userId
 * @description Get all saved articles for the user
 * @access Private
 */
savedArticlesRouter.get("/articles/saved/:userId", requireAuth, validate(fetchSavedSchema), fetchSavedArticles);

export default savedArticlesRouter;
