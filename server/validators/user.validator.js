import { z } from "zod";

export const checkEmailSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});

export const checkUsernameSchema = z.object({
  params: z.object({
    uname: z.string().min(1).max(30),
  }),
});

export const getUserDetailsSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});

export const getUserPublicSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    id: z.coerce.number().int().positive(),
    fname: z.string().min(1).max(50).optional(),
    lname: z.string().min(1).max(50).optional(),
    username: z.string().min(1).max(30).optional(),
    region: z.string().max(50).optional(),
    bio: z.string().max(201).optional(),
    email: z.string().email().optional(),
    avatar: z.string().optional(),
    oldpassword: z.string().optional(),
    password: z.string().min(8).max(100).optional(),
  }),
});

export const deleteUserSchema = z.object({
  body: z.object({
    idtodelete: z.coerce.number().int().positive(),
    email: z.string().email(),
    allowed: z.boolean(),
  }),
});
