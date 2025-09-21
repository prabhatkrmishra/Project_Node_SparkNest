import fs from "fs";
import path from "path";

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
