import fs from "fs";
import path from "path";
import config from "../config/config.js";

/**
 * Fetch image for article body
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchMedia = (req, res) => {
  const { uid, image } = req.params;
  const imagePath = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "images",
    uid,
    image
  );

  fs.stat(imagePath, (err) => {
    if (err) {
      return res.status(404).send("Requested image not found");
    }

    const ext = path.extname(image).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
};

/**
 * Fetch image for preview
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchPreviewMedia = (req, res) => {
  const { uid, articleid, image } = req.params;
  const imagePath = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "images",
    uid,
    articleid,
    image
  );

  fs.stat(imagePath, (err) => {
    if (err) {
      return res.status(404).send("Requested image not found");
    }

    const ext = path.extname(image).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
};

/**
 * Fetch all profile avatar images.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchAllProfileAvatar = (req, res) => {
  const imageDirectory = path.join(
    process.cwd(),
    "assets",
    "images",
    "avatars"
  );

  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to retrieve avatars");
    }

    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".png" || ext === ".gif";
    });

    const avatarUrls = imageFiles.map((file) =>
      `${config.backendAddress}/get/avatars/${file}`
    );

    res.json({ avatars: avatarUrls });
  });
};

/**
 * Fetch a single profile avatar image by file name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchSingleProfileAvatar = (req, res) => {
  const { avatarName } = req.params;

  const imageDirectory = path.join(
    process.cwd(),
    "assets",
    "images",
    "avatars"
  );
  const imagePath = path.join(imageDirectory, avatarName);

  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Avatar not found");
    }

    const ext = path.extname(avatarName).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
};

/**
 * Fetch a single profile avatar image by file name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchCustomProfileAvatar = (req, res) => {
  const { uid, avatarName } = req.params;

  const imageDirectory = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "images",
    uid,
    "profile"
  );
  const imagePath = path.join(imageDirectory, avatarName);

  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Avatar not found");
    }

    const ext = path.extname(avatarName).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
};

/**
 * 
 * Fetch default comment avatar
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export const fetchCommentDefaultAvatar = (req, res) => {
  const { avatarName } = req.params;

  const imageDirectory = path.join(
    process.cwd(),
    "assets",
    "images",
    "comments"
  );
  const imagePath = path.join(imageDirectory, avatarName);

  fs.stat(imagePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return res.status(404).send("Avatar not found");
    }

    const ext = path.extname(avatarName).toLowerCase();
    let contentType = "image/jpeg";
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }

    res.sendFile(imagePath, { headers: { "Content-Type": contentType } });
  });
};
