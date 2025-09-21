import { getDBClient } from "../db/db.js";

/**
 * Insert article images path into database.
 *
 * @param {Object} imagesPath - Images path object containing array
 * @param {number} articleId - The Article id for preview image
 * @returns {Promise<true|false>} Article created or null
 */
export async function inserImagestPath(imagesPath, articleId) {
  const db = getDBClient();

  const query =
    "INSERT INTO article_images (article_id, masonry, featured, thumbs) VALUES ($1, $2, $3, $4) RETURNING id";

  try {
    const result = await db.query(query, [
      articleId,
      imagesPath.masonry,
      imagesPath.featuredPaths,
      imagesPath.thumbs,
    ]);
    return (result.rows.length > 0 ? true : false);
  } catch (error) {
    console.error("Error creating article:", error);
    throw new Error("Could not create article.");
  }
}
