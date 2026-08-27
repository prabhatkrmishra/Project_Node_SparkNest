import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    user_id: z.coerce.number().int().positive(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    body: z.string().min(1),
    parent_comment_id: z.coerce.number().int().positive().nullable().optional(),
  }),
  params: z.object({
    article_id: z.coerce.number().int().positive(),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    body: z.string().min(1),
  }),
  params: z.object({
    comment_id: z.coerce.number().int().positive(),
  }),
});
