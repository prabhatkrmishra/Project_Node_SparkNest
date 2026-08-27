import { z } from "zod";

const categorySchema = z.object({
  id: z.number(),
  name: z.string().optional(),
});

export const createArticleSchema = z.object({
  body: z.object({
    user_id: z.coerce.number().int().positive(),
    title: z.string().min(3).max(255),
    body: z.string().min(1),
    preview_title: z.string().min(1).max(210),
    preview_subtitle: z.string().optional(),
    categories: z
      .string()
      .transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      })
      .pipe(z.array(categorySchema).min(1)),
  }),
});

export const updateArticleSchema = z.object({
  body: z.object({
    article_id: z.coerce.number().int().positive(),
    article_title: z.string().min(3).max(255).optional(),
    article_body: z.string().min(1).optional(),
    preview_id: z.coerce.number().int().positive(),
    preview_title: z.string().min(1).max(210).optional(),
    preview_subtitle: z.string().optional(),
    updated_categories: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      })
      .pipe(z.array(categorySchema).optional()),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(12).default(12),
  }),
});
