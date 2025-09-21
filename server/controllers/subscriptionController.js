/**
 * Controller for handling subscription-related operations.
 */

import {
  getSubscriptionByEmail,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../models/subscriptionModel.js";
import { subscribeUser } from "../services/newsletterService.js";

/**
 * Subscribe to newsletter only.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function subscribe(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to subscribe" });
  }
  const { email, type } = req.body;

  try {
    const newSubscription = await subscribeUser(email, type, true);
    if (newSubscription) {
      return res.status(200).json({ message: "Subscription successful" });
    } else {
      return res.status(200).json({ message: "Already subscribed" });
    }
  } catch (error) {
    console.error("Error during subscription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get subscription details by email.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getSubscription(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to get subscription details" });
  }

  const { email } = req.params;

  try {
    const subscription = await getSubscriptionByEmail(email);
    if (!subscription) {
      return res
        .status(404)
        .json({ message: "No subscription found for this email" });
    }
    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error getting subscription details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Update subscription details.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function updateSubscriptionDetails(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to get subscription details" });
  }

  const { email, newsletter } = req.body;

  if (!email) {
    return res.status(404).json({ message: "Received email is empty" });
  }

  try {
    const existingSubscription = await getSubscriptionByEmail(email);
    if (!existingSubscription) {
      if (await createSubscription({ email, newsletter }))
        res.status(200).json({ message: "Subscriptions updated successfully" });
      else res.status(500).json({ message: "Cannot update Subscriptions" });
    } else {
      await updateSubscription(email, { newsletter });
      res.status(200).json({ message: "Subscription updated successfully" });
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Remove subscription email from database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function unsubscribe(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to unsubscribe" });
  }

  const { email } = req.param;

  try {
    await deleteSubscription(email);
    res.status(200).json({ message: "Successfully unsubscribed" });
  } catch (error) {
    console.error("Error during unsubscription:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
