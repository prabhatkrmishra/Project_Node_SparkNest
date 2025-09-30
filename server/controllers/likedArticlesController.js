import {
  checkIfLikedArticle,
  setLikedArticle,
  unSetLikedArticle,
  getAllLikedArticles,
} from "../models/likedArticlesModel.js";

/**
 * Check if the user has liked a particular article
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function isLikedArticle(req, res) {
  const { userId, articleId } = req.params;

  if (!userId || !articleId) {
    return res.status(200).json({ liked: false });
  }

  try {
    const response = await checkIfLikedArticle(userId, articleId);
    res.status(200).json({ liked: response });
  } catch (error) {
    console.error("Error checking if article is saved:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Like an article for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function likeArticle(req, res) {
  const { user_id, article_id } = req.body;

  if(!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot LIKE" });
  }

  try {
    const response = await setLikedArticle(user_id, article_id);
    if(response){
      res.status(200).json({ message: "Article liked successfully" });
    } else {
      res.status(200).json({ message: "Error in liking article" });
    }
  } catch (error) {
    console.error("Error liking article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Unlike an article for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function unlikeArticle(req, res) {
  const { user_id, article_id } = req.body;

  if(!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot unlike" });
  }

  try {
    const response = await unSetLikedArticle(user_id, article_id);
    if (response) {
      res.status(200).json({ message: "Article unliked successfully" });
    } else {
      res.status(200).json({ message: "Article was not unliked" });
    }
  } catch (error) {
    console.error("Error unliking article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get all liked articles for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function fetchLikedArticles(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to delete user" });
  }

  const current_uid = req.session.passport ? req.session.passport.user : null;
  if (!current_uid) {
    return res.status(200).json({
      message: `Done !`,
    });
  }

  if (req.params.userId != current_uid) {
    return res.status(400).json({
      message: `Not authorized to get liked article !`,
    });
  }

  const { userId } = req.params;
  const { page = 1, limit = 12 } = req.query;

  if(limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;

    const { articles, totalCount } = await getAllLikedArticles(userId, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: `No liked article found` });
    }

    res.status(200).json({ articles, totalPages });
  } catch (error) {
    console.error("Error fetching liked articles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
