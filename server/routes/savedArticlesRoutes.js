import express from "express";
import {
  isSavedArticle,
  saveArticle,
  unsaveArticle,
  fetchSavedArticles,
} from "../controllers/savedArticlesController.js";

const savedArticlesRouter = express.Router();

/**
 * @route GET /articles/checksaved/:userId/:articleId
 * @description Check if a user has saved a specific article
 * @access Private
 */
savedArticlesRouter.get("/articles/checksaved/:userId/:articleId", isSavedArticle);

/**
 * @route POST /articles/save
 * @description Save an article for the user
 * @access Private
 */
savedArticlesRouter.post("/articles/save", saveArticle);

/**
 * @route POST /articles/unsave
 * @description Unsave an article for the user
 * @access Private
 */
savedArticlesRouter.post("/articles/unsave", unsaveArticle);

/**
 * @route GET /articles/saved/:userId
 * @description Get all saved articles for the user
 * @access Private
 */
savedArticlesRouter.get("/articles/saved/:userId", fetchSavedArticles);

export default savedArticlesRouter;
