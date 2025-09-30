import {
  addFeaturedArticle,
  getFeaturedArticles,
  clearFeaturedArticles,
} from "../models/featuredArticlesModel.js";

/**
 * Feature an article
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function featureArticle(req, res) {
  const { articleId } = req.body;

  try {
    const added = await addFeaturedArticle(articleId);
    if (added) {
      res.status(200).json({ message: "Article featured successfully" });
    } else {
      res.status(400).json({ message: "Article is already featured" });
    }
  } catch (error) {
    console.error("Error featuring article:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Get all featured articles
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function fetchFeaturedArticles(req, res) {
  try {
    const featuredArticles = await getFeaturedArticles();
    res.status(200).json(featuredArticles);
  } catch (error) {
    console.error("Error fetching featured articles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Clear featured articles (to be called weekly)
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function clearArticles(req, res) {
  try {
    await clearFeaturedArticles();
    res.status(200).json({ message: "Featured articles cleared successfully" });
  } catch (error) {
    console.error("Error clearing featured articles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
