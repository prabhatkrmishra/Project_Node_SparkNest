/**
 * Service for handling password hashing and verification using bcrypt.
 */

import bcrypt from "bcrypt";
import config from "../config/config.js";

/**
 * Hash a password.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The hashed password.
 */
export async function hashPassword(password) {
  const saltRounds = config.saltRounds;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hashed password.
 *
 * @param {string} password - The plain password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - True if the password matches, otherwise false.
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
