import { getDBClient } from "../db/db.js";

/**
 * Get categories using query
 *
 * @param {string} category - Category to be read
 * @returns {Promise<String|null>} - category exist ? true - category : false - null
 */
export async function getCategories(category) {
  const db = getDBClient();

  const query = category
    ? "SELECT * FROM categories WHERE name ILIKE $1 LIMIT 10"
    : "SELECT * FROM categories LIMIT 10";

  const values = category ? [`%${category}%`] : [];
  const result = await db.query(query, values);
  return result.rows.length > 0 ? result.rows : null;
}

/**
 * Get all categories
 *
 * @returns {Promise<String[]|null>} - categories list or null
 */
export async function getAllCategories() {
  const db = getDBClient();

  const query = "SELECT * FROM categories";

  const result = await db.query(query);
  return result.rows.length > 0 ? result.rows : null;
}