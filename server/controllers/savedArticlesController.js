import {
  checkIfSavedArticle,
  setSaveArticle,
  setUnSaveArticle,
  getAllSavedArticles,
} from "../models/savedArticlesModel.js";

/**
 * Check if the user has saved a particular article
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function isSavedArticle(req, res) {
  const { userId, articleId } = req.params;

  if(!userId || !articleId) {
    return res.status(200).json({ saved: false });
  }

  try {
    const response = await checkIfSavedArticle(userId, articleId);
    res.status(200).json({ saved: response });
  } catch (error) {
    console.error("Error checking if article is saved:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Save an article for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function saveArticle(req, res) {
  const { user_id, article_id } = req.body;

  if(!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot save" });
  }

  try {
    const response = await setSaveArticle(user_id, article_id);
    if(response){
      res.status(200).json({ message: "Article saved successfully" });
    } else {
      res.status(200).json({ message: "Error in saving article" });
    }
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Unsave an article for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function unsaveArticle(req, res) {
  const { user_id, article_id } = req.body;

  if(!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot unsave" });
  }

  try {
    const response = await setUnSaveArticle(user_id, article_id);
    if (response) {
      res.status(200).json({ message: "Article unsaved successfully" });
    } else {
      res.status(200).json({ message: "Article was not saved" });
    }
  } catch (error) {
    console.error("Error unsaving article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get all saved articles for the user
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function fetchSavedArticles(req, res) {
  const { userId } = req.params;
  const { page = 1, limit = 12 } = req.query;

  if(limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await getAllSavedArticles(userId, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: `No saved article found` });
    }

    res.status(200).json({ articles, totalPages });
  } catch (error) {
    console.error("Error fetching saved articles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
