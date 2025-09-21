import { v4 as uuidv4 } from "uuid";

import { getDBClient } from "../db/db.js";
import { hashPassword } from "../services/bcryptService.js";

/**
 * Get existing id.
 *
 * @param {number} id - The user's unique id.
 * @returns {Promise<boolean>} - id exist : True or false
 */
export async function getUserById(id) {
  const db = getDBClient();
  const query = "SELECT id FROM users WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows.length > 0 ? true : false;
}

/**
 * Get existing email.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<boolean>} - email exist : True or false
 */
export async function getUserByEmail(email) {
  const db = getDBClient();
  const query = "SELECT email FROM users WHERE email = $1";
  const result = await db.query(query, [email]);
  return result.rows.length > 0 ? true : false;
}

/**
 * Get existing username.
 *
 * @param {string} username - The user's username.
 * @returns {Promise<boolean>} - username exist : True or false
 */
export async function getUserByUsername(username) {
  const db = getDBClient();
  const query = "SELECT username FROM users WHERE username = $1";
  const result = await db.query(query, [username]);
  return result.rows.length > 0 ? true : false;
}

/**
 * Get all user details by id.
 *
 * @param {number} id - The user's ID.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserDetailId(id) {
  const db = getDBClient();
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await db.query(query, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get a user details by email.
 *
 * @param {string} email - The user's email.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserDetailEmail(email) {
  const db = getDBClient();
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await db.query(query, [email]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get specific user details by id.
 *
 * @param {number} id - The user's ID.
 * @param {string} col - The user's column.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function getUserDetail(id, col) {
  const db = getDBClient();
  const query = `SELECT ${col} FROM users WHERE id = $1`;
  const result = await db.query(query, [id]);
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
  const query =
    "INSERT INTO users (email, password, fname, lname) VALUES ($1, $2, $3, $4) RETURNING *";
  const result = await db.query(query, [
    userData.email,
    userData.password,
    userData.fname,
    userData.lname,
  ]);
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
 * @param {Map} updatedDetails - The updated user data map.
 * @returns {Promise<boolean>} - Updated ? true : false
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

  try {
    const result = await db.query(query, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating User:", error);
    return false;
  }
}

/**
 * Delete a user by ID.
 *
 * @param {number} id - The user's ID.
 * @returns {Promise<void>}
 */
export async function deleteUser(id) {
  const db = getDBClient();
  const query = "DELETE FROM users WHERE id = $1";
  await db.query(query, [id]);
}
