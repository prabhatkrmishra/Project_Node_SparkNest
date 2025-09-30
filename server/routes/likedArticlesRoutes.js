import express from "express";
import {
  isLikedArticle,
  likeArticle,
  unlikeArticle,
  fetchLikedArticles,
} from "../controllers/likedArticlesController.js";

const likedArticlesRouter = express.Router();

/**
 * @route GET /articles/checkliked/:userId/:articleId
 * @description Check if a user has saved a specific article
 * @access Private
 */
likedArticlesRouter.get(
  "/articles/checkliked/:userId/:articleId",
  isLikedArticle
);

/**
 * @route POST /articles/like
 * @description Like an article for the user
 * @access Private
 */
likedArticlesRouter.post("/articles/like", likeArticle);

/**
 * @route POST /articles/unlike
 * @description Unlike an article for the user
 * @access Private
 */
likedArticlesRouter.post("/articles/unlike", unlikeArticle);

/**
 * @route GET /articles/liked/:userId
 * @description Get all liked articles for the user
 * @access Private
 */
likedArticlesRouter.get("/articles/liked/:userId", fetchLikedArticles);

export default likedArticlesRouter;
