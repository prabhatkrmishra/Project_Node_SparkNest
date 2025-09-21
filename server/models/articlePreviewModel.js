import { getDBClient } from "../db/db.js";

/**
 * Check if article preview exist.
 *
 * @param {number} id - The article's preview ID.
 * @returns {Promise<boolean>}
 */
export async function checkArticlePreview(id) {
  const db = getDBClient();
  const query = "SELECT id FROM articles_preview WHERE id = $1";

  try {
    const result = await db.query(query, [id]);

    return result.rows.length > 0 ? true : false;
  } catch (error) {
    console.log("Error in getting article preview", error);
    return false;
  }
}

/**
 * Fetch paginated article previews and total article count from the database.
 *
 * @param {number} limit - The number of articles to fetch per page.
 * @param {number} offset - The offset to start fetching articles.
 * @returns {Promise<Object>} - An object with articles and total article count.
 */
export async function fetchArticlePreviews(limit, offset) {
  const db = getDBClient();

  const articlesQuery = `
    SELECT 
      ap.id AS preview_id,
      ap.article_id AS article_id,
      ap.preview_by,
      ap.preview_title,
      ap.preview_subtitle,
      ARRAY_AGG(c.name) AS categories,
      ai.masonry AS preview_images
    FROM 
      articles_preview ap
    JOIN 
      articles a ON ap.article_id = a.id
    LEFT JOIN 
      articles_categories ac ON a.id = ac.article_id
    LEFT JOIN 
      categories c ON ac.category_id = c.id
    LEFT JOIN 
      article_images ai ON ai.article_id = ap.article_id
    GROUP BY 
      ap.id, a.id, ai.masonry
    ORDER BY
      ap.id DESC
    LIMIT $1 OFFSET $2;
  `;

  const countQuery = `
    SELECT COUNT(id) FROM articles;
  `;

  try {
    const [articlesResult, countResult] = await Promise.all([
      db.query(articlesQuery, [limit, offset]),
      db.query(countQuery),
    ]);

    const totalCount = parseInt(countResult.rows[0].count, 10);

    return {
      articles: articlesResult.rows.length > 0 ? articlesResult.rows : [],
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching article previews or total count:", error);
    throw new Error("Could not fetch article previews or total count.");
  }
}

/**
 * Fetch paginated article and total article having specific category
 *
 * @param {string} category - Category to search for
 * @param {number} limit - The number of articles to fetch per page.
 * @param {number} offset - The offset to start fetching articles.
 * @returns {Promise<Object>} - An object with articles and total article count.
 */
export async function fetchArticlePreviewsCategory(category, limit, offset) {
  const db = getDBClient();

  const articlesQuery = `
    SELECT 
      ap.id AS preview_id,
      ap.article_id AS article_id,
      ap.preview_by,
      ap.preview_title,
      ap.preview_subtitle,
      ARRAY_AGG(c.name) AS categories,
      ai.masonry AS preview_images
    FROM 
      articles_preview ap
    JOIN 
      articles a ON ap.article_id = a.id
    LEFT JOIN 
      articles_categories ac ON a.id = ac.article_id
    LEFT JOIN 
      categories c ON ac.category_id = c.id
    LEFT JOIN 
      article_images ai ON ai.article_id = ap.article_id
    WHERE 
      c.name ILIKE '%' || $1 || '%'
    GROUP BY 
      ap.id, a.id, ai.masonry
    ORDER BY
      ap.id DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT
    COUNT(DISTINCT a.id)
    AS
      total_articles
    FROM 
      articles a
    JOIN 
      articles_categories ac ON a.id = ac.article_id
    JOIN 
      categories c ON ac.category_id = c.id
    WHERE 
      c.name ILIKE '%' || $1 || '%';
  `;

  try {
    const [articlesResult, countResult] = await Promise.all([
      db.query(articlesQuery, [category, limit, offset]),
      db.query(countQuery, [category]),
    ]);

    const totalCount = parseInt(countResult.rows[0].total_articles, 10);

    return {
      articles: articlesResult.rows.length > 0 ? articlesResult.rows : [],
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching article previews or total count:", error);
    throw new Error("Could not fetch article previews or total count.");
  }
}

/**
 * Fetch article previews from database.
 *
 * @param {number} id - User id to fetch article previews for.
 * @param {number} limit - The number of articles to fetch per page.
 * @param {number} offset - The offset to start fetching articles.
 * @returns {Promise<Array>} Article previews or empty array.
 */
export async function fetchArticlePreview(id, limit, offset) {
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
      u.id as creator_uid
    FROM 
      articles_preview ap
    JOIN 
      articles a ON ap.article_id = a.id
    LEFT JOIN 
      users u ON a.user_id = u.id
    LEFT JOIN 
      articles_categories ac ON a.id = ac.article_id
    LEFT JOIN 
      categories c ON ac.category_id = c.id
    LEFT JOIN 
      article_images ai ON ai.article_id = ap.article_id
    WHERE 
      a.user_id = $1
    GROUP BY
      ap.id, a.id, u.id, ai.masonry
    ORDER BY
      ap.id DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT
    COUNT
      (ap.id) AS total_count
    FROM
      articles_preview ap
    JOIN 
      articles a ON ap.article_id = a.id
    LEFT JOIN
      users u ON a.user_id = u.id
    WHERE
      a.user_id = $1
  `;

  try {
    const [articlesResult, countResult] = await Promise.all([
      db.query(query, [id, limit, offset]),
      db.query(countQuery, [id]),
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

/**
 * Create a new article preview.
 *
 * @param {Object} articles_preview - New articles preview to save
 * @returns {Promise<true|false>} Article created or null
 */
export async function newPreviewArticle(articles_preview) {
  const db = getDBClient();
  const query = `INSERT INTO articles_preview
      (article_id, preview_by, preview_title, preview_subtitle)
    VALUES ($1, $2, $3, $4)
    RETURNING *`;

  try {
    const result = await db.query(query, [
      articles_preview.article_id,
      articles_preview.preview_by,
      articles_preview.preview_title,
      articles_preview.preview_subtitle,
    ]);
    return result.rows.length > 0 ? true : false;
  } catch (error) {
    console.error("Error creating article preview:", error);
    throw new Error("Could not create article preview.");
  }
}

/**
 * Update a article preview.
 *
 * @param {number} id - The article's preview ID.
 * @param {Map} updatedPreview - The updated article preview map.
 * @returns {Promise<boolean>} - Updated ? true : false
 */
export async function updatePreviewArticle(id, updatedPreview) {
  const db = getDBClient();
  const setClauses = [];
  const values = [];
  let index = 1;

  updatedPreview.forEach((value, key) => {
    // 'title' <- [key] = $'1' <- index
    setClauses.push(`${key} = $${index}`);
    values.push(value);
    index++;
  });
  values.push(id);

  const query = `UPDATE articles_preview SET ${setClauses.join(
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
