import { z } from "zod";

export const subscribeSchema = z.object({
  body: z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    type: z.literal("newsletter"),
  }),
});

export const getSubscriptionSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    email: z.string().email(),
    newsletter: z.boolean(),
  }),
});

export const unsubscribeSchema = z.object({
  params: z.object({
    email: z.string().email(),
  }),
});
