import {
  checkIfSavedArticle,
  setSaveArticle,
  setUnSaveArticle,
  getAllSavedArticles,
} from "../models/savedArticlesModel.js";
import { ok, paginated } from "../utils/response.js";

/**
 * Check if the user has saved a particular article
 */
export async function isSavedArticle(req, res) {
  const { userId, articleId } = req.params;

  if (!userId || !articleId) {
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
 */
export async function saveArticle(req, res) {
  const { user_id, article_id } = req.body;

  if (!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot save" });
  }

  try {
    const response = await setSaveArticle(user_id, article_id);
    if (response) {
      return ok(res, null, { message: "Article saved successfully" });
    } else {
      return res.status(200).json({ message: "Error in saving article" });
    }
  } catch (error) {
    console.error("Error saving article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Unsave an article for the user
 */
export async function unsaveArticle(req, res) {
  const { user_id, article_id } = req.body;

  if (!user_id || !article_id) {
    return res.status(400).json({ message: "Userid or Articleid is empty, cannot unsave" });
  }

  try {
    const response = await setUnSaveArticle(user_id, article_id);
    if (response) {
      return ok(res, null, { message: "Article unsaved successfully" });
    } else {
      return res.status(200).json({ message: "Article was not saved" });
    }
  } catch (error) {
    console.error("Error unsaving article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get all saved articles for the user
 */
export async function fetchSavedArticles(req, res) {
  const current_uid = req.session.passport ? req.session.passport.user : null;
  if (!current_uid) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (String(req.params.userId) !== String(current_uid)) {
    return res.status(403).json({ message: `Not authorized to get saved article !` });
  }

  const { userId } = req.params;
  let { page = 1, limit = 12 } = req.query;

  if (limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await getAllSavedArticles(userId, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: `No saved article found` });
    }

    return paginated(res, articles, totalPages, totalCount);
  } catch (error) {
    console.error("Error fetching saved articles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
