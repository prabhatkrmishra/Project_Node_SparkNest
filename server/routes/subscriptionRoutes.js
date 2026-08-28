import express from "express";
import {
  subscribe,
  getSubscription,
  updateSubscriptionDetails,
  unsubscribe,
} from "../controllers/subscriptionController.js";
import { validate } from "../validators/validate.js";
import {
  subscribeSchema,
  getSubscriptionSchema,
  updateSubscriptionSchema,
  unsubscribeSchema,
} from "../validators/subscription.validator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const subscriptionRouter = express.Router();

/**
 * @route POST /subscribe/newsletter
 * @description Subscribe to a newsletter
 * @access Private
 */
subscriptionRouter.post("/subscribe/newsletter", requireAuth, validate(subscribeSchema), subscribe);

/**
 * @route GET /get/subscription/:email
 * @description Get subscription details by email
 * @access Private
 */
subscriptionRouter.get("/get/subscription/:email", requireAuth, validate(getSubscriptionSchema), getSubscription);

/**
 * @route PATCH /set/subscription
 * @description Update subscription details
 * @access Private
 */
subscriptionRouter.patch("/set/subscription", requireAuth, validate(updateSubscriptionSchema), updateSubscriptionDetails);

/**
 * @route DELETE /unsubscribe
 * @description Unsubscribe from the newsletter
 * @access Private
 */
subscriptionRouter.delete("/unsubscribe/:email", requireAuth, validate(unsubscribeSchema), unsubscribe);

export default subscriptionRouter;
