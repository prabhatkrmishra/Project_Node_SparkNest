import express from "express";
import multer from "multer";
import { resolveDataPath } from "../services/storageService.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import {
  createArticle,
  viewArticle,
  fetchArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/articlesController.js";
import { writeLimiter } from "../middlewares/rateLimiter.js";

const articlesRouter = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resolveDataPath("tmp", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new AppError(400, "Only images allowed"), false);
    }
    cb(null, true);
  },
});

/**
 * @route GET /article/view/:id
 * @description Fetch and view article, with related data
 * @access Private
 */
articlesRouter.get("/article/view/:id", viewArticle);

/**
 * @route GET /article/fetch/:id
 * @description Fetch article with required data
 * @access Private
 */
articlesRouter.get("/article/fetch/:id", fetchArticle);

/**
 * @route POST /article/create
 * @description Create new article
 * @access Private
 */
articlesRouter.post("/article/create", writeLimiter, upload.single("preview_image"), createArticle);

/**
 * @route PATCH /article/update
 * @description Update the article
 * @access Private
 */
articlesRouter.patch("/article/update", writeLimiter, upload.single("updated_preview_image"), updateArticle);

/**
 * @route DELETE /user/details
 * @description Update user details
 * @access Private
 */
articlesRouter.delete("/article/delete", deleteArticle);

export default articlesRouter;
