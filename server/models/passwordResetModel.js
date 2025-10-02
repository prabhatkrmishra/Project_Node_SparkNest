import { getDBClient } from "../db/db.js";

/**
 * Save email, token and date for password reset
 *
 * @param {string} email - The requested email address
 * @param {string} token - The generated token
 * @param {Date} expires - The expiry date
 * @returns {Promise<boolean>} - Query done ? true : false
 */
export async function storeResetCredentials(email, token, expires) {
  if (!email || !token || !expires) {
    return false;
  }

  const db = getDBClient();
  const query =
    "INSERT INTO password_resets (email, token, expires) VALUES ($1, $2, $3)";

  try {
    const result = await db.query(query, [email, token, expires]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error saving password reset credentials:", error);
    return false;
  }
}

/**
 * Verify token for password reset
 *
 * @param {string} email - The requested email address
 * @param {string} token - The generated token
 * @returns {Promise<boolean>} - Verified email and token ? true : false
 */
export async function verifyToken(email, token) {
  const db = getDBClient();
  const query =
    "SELECT * FROM password_resets WHERE email=$1 AND token = $2 AND expires > NOW()";

  try {
    const result = await db.query(query, [email, token]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    return false;
  }
}

/**
 * Update the user's password in the database.
 *
 * @param {string} email - The user's email address.
 * @param {string} newPassword - The new hashed password to be set.
 * @returns {Promise<boolean>} - Query executed successfully ? true : false
 */
export async function updateResetPassword(email, newPassword) {
  const db = getDBClient();
  const query = "UPDATE users SET password = $1 WHERE email = $2";
  const clearQuery = "DELETE FROM password_resets WHERE email = $1";

  try {
    await db.query(clearQuery, [email]);
    const result = await db.query(query, [newPassword, email]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating password:", error);
    return false;
  }
}
