import express from "express";
import {
  isLikedArticle,
  likeArticle,
  unlikeArticle,
  fetchLikedArticles,
} from "../controllers/likedArticlesController.js";
import { validate } from "../validators/validate.js";
import { checkLikedSchema, likeArticleSchema, fetchLikedSchema } from "../validators/liked.validator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const likedArticlesRouter = express.Router();

/**
 * @route GET /articles/checkliked/:userId/:articleId
 * @description Check if a user has saved a specific article
 * @access Public
 */
likedArticlesRouter.get("/articles/checkliked/:userId/:articleId", validate(checkLikedSchema), isLikedArticle);

/**
 * @route POST /articles/like
 * @description Like an article for the user
 * @access Private
 */
likedArticlesRouter.post("/articles/like", requireAuth, validate(likeArticleSchema), likeArticle);

/**
 * @route POST /articles/unlike
 * @description Unlike an article for the user
 * @access Private
 */
likedArticlesRouter.post("/articles/unlike", requireAuth, validate(likeArticleSchema), unlikeArticle);

/**
 * @route GET /articles/liked/:userId
 * @description Get all liked articles for the user
 * @access Private
 */
likedArticlesRouter.get("/articles/liked/:userId", requireAuth, validate(fetchLikedSchema), fetchLikedArticles);

export default likedArticlesRouter;
