import { getDBClient } from "../db/db.js";

/**
 * Check if a user has saved a specific article
 *
 * @param {number} userId - The user ID.
 * @param {number} articleId - The article ID.
 * @returns {Promise<boolean>} - Article is saved by the user ? true : false.
 */
export async function checkIfSavedArticle(userId, articleId) {
  if (!userId || !articleId) {
    return false;
  }

  const db = getDBClient();
  const query = `
    SELECT 1 FROM saved_articles 
    WHERE user_id = $1 AND article_id = $2
  `;

  try {
    const result = await db.query(query, [userId, articleId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking saved article:", error);
    return false;
  }
}

/**
 * Save an article for the user
 *
 * @param {number} user_id - The user ID.
 * @param {number} article_id - The article ID.
 * @returns {Promise<boolean>} - Returns if the article is saved ? true : false
 */
export async function setSaveArticle(user_id, article_id) {
  if (!user_id || !article_id) {
    return false;
  }

  const db = getDBClient();
  const query = `
    INSERT INTO saved_articles (user_id, article_id) 
    VALUES ($1, $2) 
    ON CONFLICT (user_id, article_id) DO NOTHING 
    RETURNING user_id
  `;
  try {
    const result = await db.query(query, [user_id, article_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error saving article:", error);
    return false;
  }
}

/**
 * Unsave an article for the user
 *
 * @param {number} user_id - The user ID.
 * @param {number} article_id - The article ID.
 * @returns {Promise<boolean>} - Returns if the article is unsaved ? true : false
 */
export async function setUnSaveArticle(user_id, article_id) {
  if (!user_id || !article_id) {
    return false;
  }

  const db = getDBClient();
  const query = `
    DELETE FROM saved_articles 
    WHERE user_id = $1 AND article_id = $2
  `;

  try {
    const result = await db.query(query, [user_id, article_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error unsaving article:", error);
    return false;
  }
}

/**
 * Get all saved articles for the user
 *
 * @param {number} userId - The user ID.
 * @param {number} limit - The number of articles to fetch per page.
 * @param {number} offset - The offset to start fetching articles.
 * @returns {Promise<Object|null>} - Query done ? Saved articles : null
 */
export async function getAllSavedArticles(userId, limit, offset) {
  const db = getDBClient();
  const query = `
    SELECT
      ap.id AS preview_id,
      ap.article_id AS article_id,
      ap.preview_by,
      ap.preview_title,
      ap.preview_subtitle,
      ARRAY_AGG(c.name) AS categories,
      ai.masonry AS preview_images,
      sa.user_id as creator_uid
    FROM
      saved_articles sa 
    JOIN
      articles_preview ap ON ap.article_id = sa.article_id
    LEFT JOIN 
      articles_categories ac ON ac.article_id = sa.article_id
    LEFT JOIN 
      categories c ON ac.category_id = c.id
    LEFT JOIN 
      article_images ai ON ai.article_id = sa.article_id
    WHERE
      sa.user_id = $1
    GROUP BY
      ap.id, sa.user_id, ai.masonry
    ORDER BY
      ap.id DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT
    COUNT
      (sa.user_id) AS total_count
    FROM
      saved_articles sa
    WHERE
      sa.user_id = $1
  `;

  try {
    const [articlesResult, countResult] = await Promise.all([
      db.query(query, [userId, limit, offset]),
      db.query(countQuery, [userId]),
    ]);

    const totalCount = parseInt(countResult.rows[0].total_count, 10);

    return {
      articles: articlesResult.rows.length > 0 ? articlesResult.rows : [],
      totalCount: totalCount > 0 ? totalCount : 0,
    };
  } catch (error) {
    console.error("Error fetching article previews:", error);
    return null;
  }
}
