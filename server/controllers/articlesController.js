/**
 * Controller for handling user-related operations.
 */

import { getUserDetail } from "../models/userModel.js";

import {
  checkArticle,
  getArticle,
  fetchTheArticle,
  newArticle,
  patchArticle,
  dropArticle,
} from "../models/articlesModel.js";

import {
  extractImages,
  saveImage,
  replaceImages,
  processAndSavePreviewImage,
  removeImages,
} from "../services/imagesServices.js";

import { inserImagestPath } from "../models/articleImagesModel.js";

import {
  checkArticlePreview,
  newPreviewArticle,
  updatePreviewArticle,
} from "../models/articlePreviewModel.js";

import {
  insertArticleCategories,
  dropArticleCategories,
} from "../models/articleCategoriesModel.js";

/**
 * Fetch and send a article from database
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function viewArticle(req, res) {
  const { id } = req.params;

  try {
    const article = await getArticle(id);
    if (!article) {
      return res
        .status(500)
        .json({ message: `Article with id:${id} doesn't exist` });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Fetch and send a article from database
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function fetchArticle(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to get article to edit" });
  }

  const { id } = req.params;

  try {
    const article = await fetchTheArticle(id);
    if (!article) {
      return res
        .status(500)
        .json({ message: `Article with id:${id} doesn't exist` });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error("Error getting article from database:", error);
    res.status(500).json({ message: "Internal Server Error, " });
  }
}

/**
 * Create new article with new preview
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function createArticle(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to create article" });
  }

  const { user_id, title, body, preview_title, preview_subtitle } = req.body;

  const images = extractImages(body);
  images.forEach((image) => {
    image.link = saveImage(image, user_id);
  });
  const newBody = await replaceImages(body, images);
  const article = {
    user_id: user_id,
    title: title,
    body: newBody,
  };

  const imageFile = req.file;
  if (!imageFile) {
    return res.status(400).json({ message: "Preview image is required" });
  }

  try {
    const cols = "username";
    const user = await getUserDetail(user_id, cols);
    if (!user) {
      return res
        .status(400)
        .json({ message: `User with id:${user_id} doesn't exist` });
    }

    const created = await newArticle(article);
    if (!created) {
      return res
        .status(400)
        .json({ message: `Cannot create article, internal error` });
    }

    const imagesPath = await processAndSavePreviewImage(
      imageFile,
      user_id,
      created.id
    );
    const inserted = await inserImagestPath(imagesPath, created.id);
    if (!inserted) {
      return res
        .status(400)
        .json({ message: `Cannot create article, internal error` });
    }

    const article_preview = {
      article_id: created.id,
      preview_by: user.username,
      preview_title: preview_title,
      preview_subtitle: preview_subtitle,
    };
    const created_preview = await newPreviewArticle(article_preview);
    if (!created_preview) {
      return res
        .status(400)
        .json({ message: `Cannot create article preview, internal error` });
    }

    const categories = JSON.parse(req.body.categories);
    if (!Array.isArray(categories) || categories.some((cat) => !cat.id)) {
      return res.status(400).json({ message: "Invalid categories" });
    }
    const lastResponse = await insertArticleCategories(created.id, categories);
    if (!lastResponse) {
      return res
        .status(400)
        .json({ message: `Cannot insert article categories, internal error` });
    }

    return res.status(200).json({ message: `Article created successfully` });
  } catch (error) {
    console.error("Error creating new article:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error, cannot create new article" });
  }
}

/**
 * Update existing article with preview
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function updateArticle(req, res) {
  if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to update article" });
  }

  const current_uid = req.session.passport ? req.session.passport.user : null;
  if (!current_uid) {
    return res.status(200).json({
      message: `Done !`,
    });
  }

  const {
    article_id,
    article_title,
    article_body,
    preview_id,
    preview_title,
    preview_subtitle,
  } = req.body;

  const imageFile = req.file;

  const article = await checkArticle(article_id);
  if (!article) {
    return res
      .status(404)
      .json({ message: "Article not found, cannot update" });
  }

  if (current_uid != article.user_id) {
    return res.status(400).json({
      message: `Not authorized to update article`,
    });
  }

  const updatedArticle = new Map();
  if (article_title) updatedArticle.set("title", article_title);
  if (article_body) {
    const images = extractImages(article_body);
    images.forEach((image) => {
      image.link = saveImage(image, article.user_id);
    });
    const newBody = await replaceImages(article_body, images);
    updatedArticle.set("body", newBody);
  }
  if (updatedArticle.size === 0) {
    return res
      .status(400)
      .json({ message: "Nothing to update in aricle, cannot update" });
  }

  const updatedArticlePreview = new Map();
  if (preview_title) updatedArticlePreview.set("preview_title", preview_title);
  if (preview_subtitle)
    updatedArticlePreview.set("preview_subtitle", preview_subtitle);
  if (updatedArticlePreview.size === 0) {
    return res
      .status(400)
      .json({ message: "Nothing to update in aricle preview, cannot update" });
  }

  const articlePreview = await checkArticlePreview(preview_id);
  if (!articlePreview) {
    return res
      .status(404)
      .json({ message: "Article not found, cannot update" });
  }

  const categories_deleted = await dropArticleCategories(article_id);
  if (!categories_deleted) {
    return res
      .status(404)
      .json({ message: "Article categories not found, cannot update" });
  }

  try {
    const articleUpdated = await patchArticle(article_id, updatedArticle);
    if (!articleUpdated) {
      return res
        .status(500)
        .json({ message: "Cannot update article, internal server error" });
    }

    const previewUpdated = await updatePreviewArticle(
      preview_id,
      updatedArticlePreview
    );
    if (!previewUpdated) {
      return res.status(500).json({
        message: "Cannot update article preview, internal server error",
      });
    }

    if (imageFile) {
      await processAndSavePreviewImage(imageFile, article.user_id, article_id);
    }

    const categories = JSON.parse(req.body.updated_categories);
    if (!Array.isArray(categories) || categories.some((cat) => !cat.id)) {
      return res.status(400).json({ message: "Invalid categories" });
    }

    const lastResponse = await insertArticleCategories(article_id, categories);
    if (!lastResponse) {
      return res
        .status(400)
        .json({ message: `Cannot insert article categories, internal error` });
    }

    res.status(200).json({ message: "Article updated successfully" });
  } catch (error) {
    console.error("Error updating article", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/**
 * Delete article.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export async function deleteArticle(req, res) {
 if (!req.isAuthenticated()) {
    return res
      .status(403)
      .json({ message: "Not authenticated to delete article" });
  }

  const current_uid = req.session.passport ? req.session.passport.user : null;
  if (!current_uid) {
    return res.status(200).json({
      message: `Done !`,
    });
  }

  const { id } = req.body;

  if (id) {
    try {
      const articleExist = await checkArticle(id);
      if (!articleExist) {
        return res.status(400).json({
          message: `Article with id:${id} not exist`,
        });
      }

      if (current_uid != articleExist.user_id) {
        return res.status(400).json({
          message: `Not authorized to delete article`,
        });
      }

      try {
        await dropArticle(id);
        await removeImages(articleExist.user_id, id);
        return res.status(200).json({
          message: `Article with id:${id} removed from database`,
        });
      } catch (error) {
        return res.status(500).json({
          message: `cannot delete Article with id:${id}`,
        });
      }
    } catch (error) {
      console.error("Error during account deletion:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ message: "Cannot delete id is empty" });
  }
}
