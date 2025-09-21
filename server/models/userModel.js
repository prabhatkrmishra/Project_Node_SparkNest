import { v4 as uuidv4 } from "uuid";

import { getDBClient } from "../db/db.js";
import { hashPassword } from "../services/bcryptService.js";

/**
 * Get existing email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserByEmail(email) {
  const db = getDBClient();
  const result = await db.query("SELECT email FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0 ? true : false;
}

/**
 * Get existing username.
 *
 * @param {string} username - The user's username.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserByUsername(username) {
  const db = getDBClient();
  const result = await db.query("SELECT username FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows.length > 0 ? true : false;
}

/**
 * Get a user details by id.
 *
 * @param {number} id - The user's ID.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserDetailId(id) {
  const db = getDBClient();
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get a user details by id.
 *
 * @param {string} email - The user's ID.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserDetailEmail(email) {
  const db = getDBClient();
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Create a new user.
 *
 * @param {Object} userData - The user data object.
 * @returns {Promise<Object>} - The newly created user object.
 */
export async function createUser(userData) {
  const db = getDBClient();
  const { email, password, fname, lname } = userData;
  const result = await db.query(
    "INSERT INTO users (email, password, fname, lname) VALUES ($1, $2, $3, $4) RETURNING *",
    [email, password, fname, lname]
  );
  return result.rows[0];
}

/**
 * Find or create a Google user.
 *
 * @param {Object} profile - The Google user's profile information.
 * @returns {Promise<Object>} - The user object.
 */
export async function CreateGoogleUser(profile) {
  const hashedPassword = await hashPassword(uuidv4());
  let googleUser = await createUser({
    fname: profile.given_name,
    lname: profile.family_name,
    email: profile.email,
    password: hashedPassword,
  });

  return googleUser;
}

/**
 * Update user details.
 *
 * @param {number} id - The user's ID.
 * @param {Map} updatedDetails - The updated user data object.
 * @returns {Promise<void>}
 */
export async function updateUser(id, updatedDetails) {
  const db = getDBClient();
  const setClauses = [];
  const values = [];
  let index = 1;

  updatedDetails.forEach((value, key) => {
    // 'username' <- [key] = $'1' <- index
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  });
  values.push(id);

  const query = `UPDATE users SET ${setClauses.join(
    ", "
  )} WHERE id = $${index}`;
  await db.query(query, values);

  return true;
}

/**
 * Delete a user by ID.
 *
 * @param {number} id - The user's ID.
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const db = getDBClient();
  await db.query("DELETE FROM users WHERE id = $1", [id]);
}
