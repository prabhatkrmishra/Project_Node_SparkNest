import { getDBClient } from "../db/db.js";

/**
 * Add an article to the featured list
 *
 * @param {number} articleId - The ID of the article to feature.
 * @returns {Promise<boolean>} - Returns true if added successfully, false if it already exists.
 */
export async function addFeaturedArticle(articleId) {
  const db = getDBClient();
  const query = `
    INSERT INTO featured_articles (article_id) 
    VALUES ($1) 
    ON CONFLICT (article_id) DO NOTHING RETURNING article_id;
  `;

  const result = await db.query(query, [articleId]);
  return result.rows.length > 0; // Returns true if the article was added
}

/**
 * Fetch all featured articles
 *
 * @returns {Promise<Array>} - List of featured article.
 */
export async function getFeaturedArticles() {
  const db = getDBClient();

  const query = `
    SELECT
        ap.id AS preview_id,
        f.article_id,
        ap.preview_title,
        ap.preview_subtitle,
        ARRAY_AGG(c.name) AS categories,
        ai.featured AS featured_images
    FROM
        featured_articles f
	  JOIN
        articles_preview ap ON ap.article_id = f.article_id
    LEFT JOIN 
        articles_categories ac ON ac.article_id = f.article_id
    LEFT JOIN 
        categories c ON ac.category_id = c.id
    LEFT JOIN 
        article_images ai ON ai.article_id = f.article_id
    GROUP BY 
        f.id, ap.id, ai.featured
    ORDER BY
        f.id ASC;
  `;

  try {
    const result = await db.query(query);
    return result.rows;
  } catch(error) {
    console.log(error);
    return [];
  }
}

/**
 * Remove all articles from the featured list (for weekly updates)
 *
 * @returns {Promise<void>}
 */
export async function clearFeaturedArticles() {
  const db = getDBClient();
  const query = `DELETE FROM featured_articles;`;
  await db.query(query);
}

/**
 * Update featured articles by selecting the top 3 most liked articles
 * and clearing the previous entries in the featured articles table.
 */
export async function updateFeaturedArticles() {
    const db = getDBClient();
  
    try {
      await db.query("DELETE FROM featured_articles");
  
      const result = await db.query(`
        SELECT article_id
        FROM liked_articles
        GROUP BY article_id
        ORDER BY COUNT(user_id) DESC
        LIMIT 3
      `);
  
      const topLikedArticleIds = result.rows.map(row => row.article_id);
  
      const currentCount = topLikedArticleIds.length;
      if (currentCount < 3) {
        const remainingCount = 3 - currentCount;
        const randomArticlesResult = await db.query(`
          SELECT id
          FROM articles
          WHERE id NOT IN (
            SELECT article_id FROM liked_articles
          )
          ORDER BY RANDOM()
          LIMIT $1
        `, [remainingCount]);
  
        const randomArticleIds = randomArticlesResult.rows.map(row => row.id);
        topLikedArticleIds.push(...randomArticleIds);
      }
  
      const insertPromises = topLikedArticleIds.map(async (articleId) => {
        await db.query("INSERT INTO featured_articles (article_id) VALUES ($1)", [articleId]);
      });
  
      await Promise.all(insertPromises);
  
      console.log("Featured articles updated successfully");
    } catch (error) {
      console.error("Error updating featured articles:", error);
    }
  }