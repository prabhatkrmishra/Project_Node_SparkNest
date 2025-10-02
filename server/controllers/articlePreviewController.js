import {
  fetchArticlePreviews,
  fetchArticlePreview,
  fetchArticlePreviewsCategory
} from "../models/articlePreviewModel.js";

/**
 * Fetch and send a articles preview from database
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getAllArticlePreview(req, res) {
  const { page = 1, limit = 12 } = req.query;

  if(limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreviews(limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: "No articles found" });
    }

    res.status(200).json({ articles, totalPages });
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Fetch and send a articles preview from database
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getAllArticlePreviewCategory(req, res) {
  const { category } = req.params;
  const { page = 1, limit = 12 } = req.query;

  if(limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreviewsCategory(category, limit, offset);

    const totalPages = Math.ceil(totalCount / limit);

    if (!articles.length) {
      return res.status(200).json({ message: `No articles found having category ${category}` });
    }

    res.status(200).json({ articles, totalPages });
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Fetch and send a articles preview of
 * a specific user from database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function getArticlePreview(req, res) {
  const { id } = req.params;
  const { page = 1, limit = 12 } = req.query;

  if(limit > 12) {
    limit = 12;
  }

  try {
    const offset = (page - 1) * limit;
    const { articles, totalCount } = await fetchArticlePreview(
      id,
      limit,
      offset
    );

    const totalPages = Math.ceil(totalCount / limit);

    if (articles && articles.length < 1) {
      return res
        .status(200)
        .json({ message: `Article with user id:${id} doesn't exist` });
    }

    res.status(200).json({
      articles,
      totalPages,
    });
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}