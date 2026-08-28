import fs from "fs";
import path from "path";
import { env } from "../config/env.js";
import { resolveDataPath } from "../services/storageService.js";
import { AppError } from "../middlewares/errorMiddleware.js";

function sanitizeSegment(value) {
  const str = String(value);
  const safe = str.replace(/[^a-zA-Z0-9._-]/g, "");
  if (safe !== str || safe.includes("..")) {
    throw new AppError(400, "Invalid path segment");
  }
  return safe;
}

function sendWithCache(req, res, imagePath, contentType) {
  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Requested image not found");
    }

    const etag = `"${stat.mtimeMs}-${stat.size}"`;
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
}

function contentTypeFor(ext) {
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

/**
 * Fetch image for article body
 */
export const fetchMedia = (req, res, next) => {
  try {
    const uid = sanitizeSegment(req.params.uid);
    const image = sanitizeSegment(req.params.image);
    const imagePath = resolveDataPath("images", uid, image);
    const ext = path.extname(image).toLowerCase();
    sendWithCache(req, res, imagePath, contentTypeFor(ext));
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch image for preview
 */
export const fetchPreviewMedia = (req, res, next) => {
  try {
    const uid = sanitizeSegment(req.params.uid);
    const articleid = sanitizeSegment(req.params.articleid);
    const image = sanitizeSegment(req.params.image);
    const imagePath = resolveDataPath("images", uid, articleid, image);
    const ext = path.extname(image).toLowerCase();
    sendWithCache(req, res, imagePath, contentTypeFor(ext));
  } catch (err) {
    next(err);
  }
};

let avatarCache = null;
let avatarCacheTime = 0;
const AVATAR_CACHE_TTL = 60 * 60 * 1000;

/**
 * Fetch all profile avatar images.
 */
export const fetchAllProfileAvatar = (req, res) => {
  const now = Date.now();
  if (avatarCache && now - avatarCacheTime < AVATAR_CACHE_TTL) {
    return res.json({ avatars: avatarCache });
  }

  const imageDirectory = path.join(process.cwd(), "assets", "images", "avatars");

  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to retrieve avatars");
    }

    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".png" || ext === ".gif";
    });

    const avatarUrls = imageFiles.map((file) => `${env.BACKEND_ADDRESS}/get/avatars/${file}`);

    avatarCache = avatarUrls;
    avatarCacheTime = now;

    res.json({ avatars: avatarUrls });
  });
};

/**
 * Fetch a single profile avatar image by file name.
 */
export const fetchSingleProfileAvatar = (req, res) => {
  const { avatarName } = req.params;
  const safeName = sanitizeSegment(avatarName);

  const imageDirectory = path.join(process.cwd(), "assets", "images", "avatars");
  const imagePath = path.join(imageDirectory, safeName);

  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Avatar not found");
    }

    const ext = path.extname(safeName).toLowerCase();
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(imagePath, { headers: { "Content-Type": contentTypeFor(ext) } });
  });
};

/**
 * Fetch a user uploaded avatar
 */
export const fetchCustomProfileAvatar = (req, res, next) => {
  try {
    const uid = sanitizeSegment(req.params.uid);
    const avatarName = sanitizeSegment(req.params.avatarName);

    const imageDirectory = resolveDataPath("images", uid, "profile");
    const imagePath = path.join(imageDirectory, avatarName);

    fs.stat(imagePath, (err, stat) => {
      if (err || !stat.isFile()) {
        return res.status(404).send("Avatar not found");
      }

      const ext = path.extname(avatarName).toLowerCase();
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.sendFile(imagePath, { headers: { "Content-Type": contentTypeFor(ext) } });
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch default comment avatar
 */
export const fetchCommentDefaultAvatar = (req, res) => {
  const { avatarName } = req.params;
  const safeName = sanitizeSegment(avatarName);

  const imageDirectory = path.join(process.cwd(), "assets", "images", "comments");
  const imagePath = path.join(imageDirectory, safeName);

  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Avatar not found");
    }

    const ext = path.extname(safeName).toLowerCase();
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(imagePath, { headers: { "Content-Type": contentTypeFor(ext) } });
  });
};
