import { getDBClient } from "../db/db.js";

/**
 * Check if a user has liked a specific article
 *
 * @param {number} userId - The user ID.
 * @param {number} articleId - The article ID.
 * @returns {Promise<boolean>} - Article is liked by the user ? true : false.
 */
export async function checkIfLikedArticle(userId, articleId) {
  if (!userId || !articleId) {
    return false;
  }

  const db = getDBClient();
  const query = `
    SELECT 1 FROM liked_articles 
    WHERE user_id = $1 AND article_id = $2
  `;

  try {
    const result = await db.query(query, [userId, articleId]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking saved article:", error);
    throw error;
  }
}

/**
 * Like an article for the user
 *
 * @param {number} user_id - The user ID.
 * @param {number} article_id - The article ID.
 * @returns {Promise<boolean>} - Returns if the article is liked ? true : false
 */
export async function setLikedArticle(user_id, article_id) {
  if (!user_id || !article_id) {
    return false;
  }

  const db = getDBClient();
  const query = `
      INSERT INTO liked_articles (user_id, article_id) 
      VALUES ($1, $2) 
      ON CONFLICT (user_id, article_id) DO NOTHING
      RETURNING user_id
    `;
  try {
    const result = await db.query(query, [user_id, article_id]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error liking article:", error);
    return false;
  }
}

/**
 * Unlike an article for the user
 *
 * @param {number} user_id - The user ID.
 * @param {number} article_id - The article ID.
 * @returns {Promise<boolean>} - Returns if the article is unliked ? true : false
 */
export async function unSetLikedArticle(user_id, article_id) {
  if (!user_id || !article_id) {
    return false;
  }

  const db = getDBClient();
  const query = `
      DELETE FROM liked_articles 
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
 * Get all liked articles for the user
 *
 * @param {number} userId - The user ID.
 * @param {number} limit - The number of articles to fetch per page.
 * @param {number} offset - The offset to start fetching articles.
 */
export async function getAllLikedArticles(userId, limit, offset) {
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
      la.user_id as creator_uid
    FROM
      liked_articles la 
    JOIN
      articles_preview ap ON ap.article_id = la.article_id
    LEFT JOIN 
      articles_categories ac ON ac.article_id = la.article_id
    LEFT JOIN 
      categories c ON ac.category_id = c.id
    LEFT JOIN 
      article_images ai ON ai.article_id = la.article_id
    WHERE
      la.user_id = $1
    GROUP BY
      ap.id, la.user_id, ai.masonry
    ORDER BY
      ap.id DESC
    LIMIT $2 OFFSET $3;
    `;

    const countQuery = `
    SELECT
    COUNT
      (la.user_id) AS total_count
    FROM
      liked_articles la
    WHERE
      la.user_id = $1
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
    throw new Error("Could not fetch article previews.");
  }
}
