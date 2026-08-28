import { z } from "zod";

export const checkLikedSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
    articleId: z.coerce.number().int().positive(),
  }),
});

export const likeArticleSchema = z.object({
  body: z.object({
    user_id: z.coerce.number().int().positive(),
    article_id: z.coerce.number().int().positive(),
  }),
});

export const fetchLikedSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(12).default(12),
  }),
});
