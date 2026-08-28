import { z } from "zod";

export const checkSavedSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
    articleId: z.coerce.number().int().positive(),
  }),
});

export const saveArticleSchema = z.object({
  body: z.object({
    user_id: z.coerce.number().int().positive(),
    article_id: z.coerce.number().int().positive(),
  }),
});

export const fetchSavedSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(12).default(12),
  }),
});
