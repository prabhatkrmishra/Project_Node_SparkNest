import express from "express";
import {
  subscribe,
  getSubscription,
  updateSubscriptionDetails,
  unsubscribe,
} from "../controllers/subscriptionController.js";

const subscriptionRouter = express.Router();

/**
 * @route POST /subscribe/newsletter
 * @description Subscribe to a newsletter
 * @access Public
 */
subscriptionRouter.post("/subscribe/newsletter", subscribe);

/**
 * @route GET /get/subscription/:email
 * @description Get subscription details by email
 * @access Private
 */
subscriptionRouter.get("/get/subscription/:email", getSubscription);

/**
 * @route PATCH /set/subscription
 * @description Update subscription details
 * @access Private
 */
subscriptionRouter.patch("/set/subscription", updateSubscriptionDetails);

/**
 * @route DELETE /unsubscribe
 * @description Unsubscribe from the newsletter
 * @access Private
 */
subscriptionRouter.delete("/unsubscribe/:email", unsubscribe);

export default subscriptionRouter;
