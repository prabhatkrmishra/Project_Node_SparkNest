/**
 * Subscription model for handling subscription-related database operations.
 */

import { getDBClient } from "../db/db.js";

/**
 * Get a subscription by email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} - The subscription object or null if not found.
 */
export async function getSubscriptionByEmail(email) {
  const db = getDBClient();
  const result = await db.query("SELECT * FROM subscription WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Create a new subscription.
 *
 * @param {Object} subscriptionData - The subscription data object.
 * @returns {Promise<Object>} - The newly created subscription object.
 */
export async function createSubscription(subscriptionData) {
  const db = getDBClient();
  const { email, newsletter } = subscriptionData;
  const result = await db.query(
    "INSERT INTO subscription (email, newsletter) VALUES ($1, $2) RETURNING *",
    [email, newsletter]
  );
  return result.rows[0] ? true : false;
}

/**
 * Update a subscription.
 *
 * @param {string} email - The user's email address.
 * @param {Object} updatedData - The subscription data object.
 * @returns {Promise<void>}
 */
export async function updateSubscription(email, updatedData) {
  const db = getDBClient();
  const setClauses = [];
  const values = [];
  let index = 1;

  for (const key in updatedData) {
    setClauses.push(`${key} = $${index}`);
    values.push(updatedData[key]);
    index++;
  }
  values.push(email);

  const query = `UPDATE subscription SET ${setClauses.join(
    ", "
  )} WHERE email = $${index}`;
  await db.query(query, values);
}

/**
 * Delete a subscription by email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
export async function deleteSubscription(email) {
  const db = getDBClient();
  await db.query("DELETE FROM subscription WHERE email = $1", [email]);
}
