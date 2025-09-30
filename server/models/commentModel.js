import { getDBClient } from "../db/db.js";
import config from "../config/config.js";

const defaultAvatar = `${config.backendAddress}/get/default/default_avatar.jpg`;

/**
 * Check if comment exist and return uid of that comment.
 *
 * @param {number} id - The cpmment ID.
 * @returns {Promise<Object|null>}
 */
export async function checkComment(id) {
  const db = getDBClient();
  const query = "SELECT user_id FROM comments WHERE id = $1";
  const result = await db.query(query, [id]);

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Fetch all comments for a specific article.
 *
 * @param {number} article_id - The ID of the article for which comments are to be fetched.
 * @returns {Promise<Array>} Array of comment objects or an empty array.
 */
export async function getComment(article_id) {
  const db = getDBClient();
  const query = `
    SELECT
      c.id,
      c.article_id,
      c.user_id,
      c.parent_comment_id,
      c.name,
      c.body,
      c.updated_at,
  COALESCE(u.avatar, '${defaultAvatar}') AS avatar
    FROM
      comments c
    LEFT JOIN
      users u ON u.email = c.email
    WHERE
      article_id = $1
    ORDER BY
      c.created_at ASC;
  `;

  try {
    const result = await db.query(query, [article_id]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new Error("Could not fetch comments.");
  }
}

/**
 * Add a new comment to an article.
 *
 * @param {number} article_id - The ID of the article to which the comment belongs.
 * @param {Object} commentBody - The content of the comment.
 * @param {string} commentBody.name - The name of the person making the comment.
 * @param {string} commentBody.email - The email of the person making the comment.
 * @param {string} commentBody.body - The body text of the comment.
 * @param {number|null} [commentBody.parent_comment_id] - The ID of the parent comment ? if it's a reply : null if it is not a reply.
 * @returns {Promise<Object>} The created comment object.
 */
export async function setComment(article_id, commentBody) {
  const db = getDBClient();
  const query = `
    WITH inserted_comment AS (
      INSERT INTO comments (article_id, user_id, parent_comment_id, name, email, body)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, article_id, user_id, parent_comment_id, name, email, body, created_at, updated_at
    )
    SELECT
        ic.id, 
        ic.article_id,
        ic.user_id,
        ic.parent_comment_id,
        ic.name,
        ic.body,
        ic.created_at,
        ic.updated_at,
        COALESCE(u.avatar, '${defaultAvatar}') AS avatar
    FROM
        inserted_comment ic
    LEFT JOIN
        users u ON u.email = ic.email
  `;

  const { user_id, name, email, body, parent_comment_id } = commentBody;

  try {
    const result = await db.query(query, [
      article_id,
      user_id,
      parent_comment_id,
      name,
      email,
      body
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Could not add comment.");
  }
}

/**
 * Update an existing comment.
 *
 * @param {number} comment_id - The ID of the comment to update.
 * @param {Object} updateBody - The updated content of the comment.
 * @param {string} updateBody.body - The new body text of the comment.
 * @returns {Promise<Object>} The updated comment object or null if not found.
 */
export async function patchComment(comment_id, updateBody) {
  const db = getDBClient();
  const query = `
    UPDATE comments
    SET body = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, article_id, user_id, parent_comment_id, name, email, body, created_at, updated_at;
  `;

  const { body } = updateBody;

  try {
    const result = await db.query(query, [body, comment_id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Could not update comment.");
  }
}

/**
 * Delete a comment by its ID.
 *
 * @param {number} comment_id - The ID of the comment to delete.
 * @returns {Promise<boolean>} True if the comment was deleted, false if not found.
 */
export async function dropComment(comment_id) {
  const db = getDBClient();
  const query = `
    DELETE FROM comments 
    WHERE id = $1
    RETURNING id;
  `;

  try {
    const result = await db.query(query, [comment_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Could not delete comment.");
  }
}
