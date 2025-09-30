import express from "express";
import {
  featureArticle,
  fetchFeaturedArticles,
  clearArticles,
} from "../controllers/featuredArticlesController.js";

const featuredArticlesRouter = express.Router();

/**
 * @route POST /articles/feature
 * @description Feature an article
 * @access Private
 */
featuredArticlesRouter.post("/articles/feature", featureArticle);

/**
 * @route GET /articles/featured
 * @description Get all featured articles
 * @access Public
 */
featuredArticlesRouter.get("/articles/featured", fetchFeaturedArticles);

/**
 * @route DELETE /articles/featured
 * @description Clear all featured articles (weekly update)
 * @access Private
 */
featuredArticlesRouter.delete("/articles/featured", clearArticles);

export default featuredArticlesRouter;
