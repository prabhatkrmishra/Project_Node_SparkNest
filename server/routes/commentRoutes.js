import express from "express";

import {
  fetchComment,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { validate } from "../validators/validate.js";
import { createCommentSchema, updateCommentSchema } from "../validators/comment.validator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const commentRouter = express.Router();

/**
 * @route GET /comment/fetch/:article_id
 * @description Get comment with database
 * @access Public
 */
commentRouter.get("/comment/fetch/:article_id", fetchComment);

/**
 * @route POST /comment/create/:article_id
 * @description Create new comment on article id
 * @access Private
 */
commentRouter.post("/comment/create/:article_id", requireAuth, validate(createCommentSchema), createComment);

/**
 * @route PATCH /comment/update/:comment_id
 * @description Update an existing comment
 * @access Private
 */
commentRouter.patch("/comment/update/:comment_id", requireAuth, validate(updateCommentSchema), updateComment);

/**
 * @route DELETE /comment/delete/:comment_id
 * @description Delete a comment with commend id
 * @access Private
 */
commentRouter.delete("/comment/delete/:comment_id", requireAuth, deleteComment);

export default commentRouter;
