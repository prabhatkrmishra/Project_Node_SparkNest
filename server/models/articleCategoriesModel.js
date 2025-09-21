import { getDBClient } from "../db/db.js";

/**
 * Insert multiple categories for a given article.
 *
 * @param {number} articleId - The ID of the article to associate with categories.
 * @param {Array<Object>} categories - Array of category objects containing `id` and `name`.
 * @returns {Promise<true|false>} - Returns true if all categories were inserted successfully, otherwise false.
 */
export async function insertArticleCategories(articleId, categories) {
  const db = getDBClient();
  const insertCategoryQuery = `
    INSERT INTO articles_categories (article_id, category_id) 
    VALUES ($1, $2)
  `;

  await db.query('BEGIN');
  
  try {
    for (let i = 0; i < categories.length; i++) {
      await db.query(insertCategoryQuery, [articleId, categories[i].id]);
    }

    await db.query('COMMIT');
    return true;
  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Error inserting categories for article:", error);
    return false;
  }
}

/**
 * Delete a article by ID.
 *
 * @param {number} id - The article's ID.
 * @returns {Promise<void>}
 */
export async function dropArticleCategories(id) {
  const db = getDBClient();
  const query = "DELETE FROM articles_categories WHERE article_id = $1";

  try {
    await db.query(query, [id]);
    return true;
  } catch (error) {
    console.log('Error in deleting article categories', error);
    return false;
  }
}
