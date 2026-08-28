import { getDBClient } from "../db/db.js";
import { createHash } from "crypto";

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Save email, token and date for password reset (token is hashed at rest).
 */
export async function storeResetCredentials(email, token, expires) {
  if (!email || !token || !expires) {
    return false;
  }

  const db = getDBClient();
  const hashed = hashToken(token);

  try {
    // Remove old tokens for this email to keep single active token
    await db.query("DELETE FROM password_resets WHERE email = $1", [email]);
    const result = await db.query(
      "INSERT INTO password_resets (email, token, expires) VALUES ($1, $2, $3)",
      [email, hashed, expires]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error saving password reset credentials:", error);
    return false;
  }
}

/**
 * Verify token for password reset (compares hash).
 */
export async function verifyToken(email, token) {
  const db = getDBClient();
  const hashed = hashToken(token);
  const query = "SELECT * FROM password_resets WHERE email=$1 AND token = $2 AND expires > NOW()";

  try {
    const result = await db.query(query, [email, hashed]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error verifying password reset token:", error);
    return false;
  }
}

/**
 * Update the user's password in the database.
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
