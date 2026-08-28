import express from "express";

import {
  getArticlePreview,
  getAllArticlePreview,
  getAllArticlePreviewCategory,
} from "../controllers/articlePreviewController.js";
import { validate } from "../validators/validate.js";
import { paginationSchema } from "../validators/article.validator.js";
import { z } from "zod";

const articlePreviewRouter = express.Router();

const categoryParamSchema = z.object({
  params: z.object({
    category: z.string().min(1),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(12).default(12),
  }),
});

const profileParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(12).default(12),
  }),
});

/**
 * @route GET /article/previews
 * @description Fetch and view article preview
 * @access Public
 */
articlePreviewRouter.get("/article/previews", validate(paginationSchema), getAllArticlePreview);

/**
 * @route GET /article/preview
 * @description Fetch and view article preview
 * @access Public
 */
articlePreviewRouter.get(
  "/article/preview/category/:category",
  validate(categoryParamSchema),
  getAllArticlePreviewCategory
);

/**
 * @route GET /article/profile/preview/:id
 * @description Fetch and view user created article
 * @access Public
 */
articlePreviewRouter.get("/article/profile/preview/:id", validate(profileParamSchema), getArticlePreview);

export default articlePreviewRouter;
