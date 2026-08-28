import {
  fetchArticlePreviews,
  fetchArticlePreview,
  fetchArticlePreviewsCategory,
} from "../models/articlePreviewModel.js";
import { paginated } from "../utils/response.js";

/**
 * Fetch and send a articles preview from database
 */
export async function getAllArticlePreview(req, res) {
  let { page = 1, limit = 12 } = req.query;

  if (limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreviews(limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: "No articles found" });
    }

    return paginated(res, articles, totalPages, totalCount);
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Fetch and send a articles preview from database
 */
export async function getAllArticlePreviewCategory(req, res) {
  const { category } = req.params;
  let { page = 1, limit = 12 } = req.query;

  if (limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreviewsCategory(category, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: `No articles found having category ${category}` });
    }

    return paginated(res, articles, totalPages, totalCount);
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Fetch and send a articles preview of
 * a specific user from database.
 */
export async function getArticlePreview(req, res) {
  const { id } = req.params;
  let { page = 1, limit = 12 } = req.query;

  if (limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreview(id, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (articles && articles.length < 1) {
      return res.status(200).json({ message: `Article with user id:${id} doesn't exist` });
    }

    return paginated(res, articles, totalPages, totalCount);
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}
