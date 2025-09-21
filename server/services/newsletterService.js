/**
 * Service for managing newsletter subscriptions.
 */

import { getDBClient } from "../db/db.js";

/**
 * Subscribe a user to newsletter.
 * Can be used to subscribe to a
 * specific type without login.
 * 
 * Currently only for 'newsletter'
 *
 * @param {string} email - The user's email address.
 * @param {string} type - The type of subscription : newsletter.
 * @param {boolean} permission - The user's permission status.
 * @returns {Promise<void>}
 */
export async function subscribeUser(email, type, permission) {
  const db = getDBClient();
  const result = await db.query("SELECT * FROM subscription WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    if (type !== 'newsletter') return;
    const query = `INSERT INTO subscription (email, ${type}) VALUES ($1, $2)`;
    await db.query(query, [email, permission]);
    return true;
  }

  return false;
}