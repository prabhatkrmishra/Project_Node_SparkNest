import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    fname: z.string().min(1).max(50).optional(),
    lname: z.string().min(1).max(50).optional(),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    newsletter: z.boolean().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    useremail: z.string().email(),
    password: z.string().min(1),
    savesession: z.boolean().optional(),
  }),
});
