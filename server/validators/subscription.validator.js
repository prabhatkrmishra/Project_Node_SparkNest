import { z } from "zod";

export const subscribeSchema = z.object({
  body: z.object({
    email: z.string().email(),
    type: z.string().min(1),
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
