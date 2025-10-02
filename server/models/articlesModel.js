import { getDBClient } from "../db/db.js";

/**
 * Check if article exist and return uid of that article.
 *
 * @param {number} id - The article's ID.
 * @returns {Promise<Object|null>}
 */
export async function checkArticle(id) {
  const db = getDBClient();
  const query = "SELECT user_id FROM articles WHERE id = $1";
  const result = await db.query(query, [id]);

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get article using article id
 *
 * @param {number} id - Article id to read
 * @returns {Promise<Object|null>} - article exist ? true - article : false - null
 */
export async function getArticle(id) {
  const db = getDBClient();

  const query = `
    WITH selected_article AS (
      SELECT
        a.id AS article_id,
        a.user_id,
        a.title AS article_title,
        a.created_at AS created_date,
        a.updated_at AS updated_date,
        a.body AS article_body,
        ai.thumbs AS article_images,
        ARRAY_AGG(c.name) AS article_categories,
        u.fname,
        u.lname,
        u.username,
        u.bio,
        u.avatar
      FROM
        articles a
      JOIN
        users u ON a.user_id = u.id
      JOIN
        articles_categories ac ON ac.article_id = a.id
      JOIN
        categories c ON c.id = ac.category_id
      JOIN
        article_images ai ON ai.article_id = a.id
      WHERE
        a.id = $1
      GROUP BY
        a.id, u.id, ai.thumbs
    )
    SELECT 
      sa.*,
        (SELECT id FROM articles WHERE created_at < sa.created_date ORDER BY created_at DESC LIMIT 1) AS prev_id,
        (SELECT title FROM articles WHERE created_at < sa.created_date ORDER BY created_at DESC LIMIT 1) AS prev_title,
        (SELECT id FROM articles WHERE created_at > sa.created_date ORDER BY created_at ASC LIMIT 1) AS next_id,
        (SELECT title FROM articles WHERE created_at > sa.created_date ORDER BY created_at ASC LIMIT 1) AS next_title
    FROM 
      selected_article sa;
  `;

  const result = await db.query(query, [id]);
  if (result.rows.length > 0) {
    return {
      article: result.rows[0],
      prev: {
        id: result.rows[0].prev_id,
        title: result.rows[0].prev_title,
      },
      next: {
        id: result.rows[0].next_id,
        title: result.rows[0].next_title,
      },
    };
  }

  return null;
}

/**
 * Fetch article with related data
 *
 * @param {number} id - Article id to fetch
 * @returns {Promise<Object|null>} - article exist ? true - article : false - null
 */
export async function fetchTheArticle(id) {
  const db = getDBClient();

  const query = `
      SELECT
        a.id AS article_id,
        a.title AS article_title,
        a.body AS article_body,
        ARRAY_AGG(c.id) AS article_cids,
        ARRAY_AGG(c.name) AS article_cnames
      FROM
        articles a
      JOIN
        articles_categories ac ON ac.article_id = a.id
      JOIN
        categories c ON c.id = ac.category_id
      WHERE
        a.id = $1
      GROUP BY
        a.id
  `;

  const result = await db.query(query, [id]);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Create a new article.
 *
 * @param {Object} article - New article to save
 * @returns {Promise<Object|null>} Article created or null
 */
export async function newArticle(article) {
  const db = getDBClient();
  const query =
    "INSERT INTO articles (user_id, title, body) VALUES ($1, $2, $3) RETURNING id, user_id";

  try {
    const result = await db.query(query, [
      article.user_id,
      article.title,
      article.body,
    ]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error creating article:", error);
    throw new Error("Could not create article.");
  }
}

/**
 * Update article with a given id.
 *
 * @param {number} id - The article's ID.
 * @param {Map} updatedArticle - The updated article map.
 * @returns {Promise<boolean>} - Updated ? true : false
 */
export async function patchArticle(id, updatedArticle) {
  const db = getDBClient();
  const setClauses = [];
  const values = [];
  let index = 1;

  updatedArticle.forEach((value, key) => {
    // 'title' <- [key] = $'1' <- index
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  });
  values.push(id);

  const query = `UPDATE articles SET ${setClauses.join(
    ", "
  )} WHERE id = $${index}`;

  try {
    const result = await db.query(query, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating article:", error);
    return false;
  }
}

/**
 * Delete a article by ID.
 *
 * @param {number} id - The article's ID.
 * @returns {Promise<void>}
 */
export async function dropArticle(id) {
  const db = getDBClient();
  const query = "DELETE FROM articles WHERE id = $1";
  await db.query(query, [id]);
}
