import {
  getComment,
  setComment,
  patchComment,
  dropComment,
} from "../models/commentModel.js";

/**
 * Fetch comments for an article.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchComment = async (req, res) => {
  const { article_id } = req.params;

  try {
    const result = await getComment(article_id);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, cannot fetch comments.");
  }
};

/**
 * Create a new comment for an article.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const createComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to create comments" });
  }

  const { article_id } = req.params;
  const { user_id, name, email, body, parent_comment_id } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "Cannot create commment, user ID is empty" });
  }

  try {
    const result = await setComment(article_id, {
      user_id,
      name,
      email,
      body,
      parent_comment_id,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, cannot create comment.");
  }
};

/**
 * Update an existing comment.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const updateComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to update comments" });
  }

  const { comment_id } = req.params;
  const { body } = req.body;

  try {
    const result = await patchComment(comment_id, { body });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("Comment not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, cannot update comment.");
  }
};

/**
 * Delete a comment by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const deleteComment = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to update comments" });
  }

  const { comment_id } = req.params;

  try {
    const result = await dropComment(comment_id);
    if (result) {
      res.status(200).send("Comment deleted successfully.");
    } else {
      res.status(200).send("Comment not found.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error, cannot delete comment.");
  }
};
