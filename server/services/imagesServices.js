import { promises as fsPromises } from "fs";
import path from "path";
import sharp from "sharp";
import { createHash } from "crypto";
import { env } from "../config/env.js";
import { resolveDataPath, ensureDir, removeDir } from "./storageService.js";
import { AppError } from "../middlewares/errorMiddleware.js";

const imageRegex = /<img src="data:image\/([a-zA-Z]+);base64,([a-zA-Z0-9+/=]*)"[^>]*>/g;

const ALLOWED_TYPES = new Set(["jpeg", "jpg", "png", "webp", "gif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const hashImageData = (data) => {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
};

/**
 * Extract the images from the article body.
 */
export const extractImages = (articleBody) => {
  const images = [];
  let match;
  // Reset regex state for global flag
  imageRegex.lastIndex = 0;
  while ((match = imageRegex.exec(articleBody)) !== null) {
    const imageData = match[2];
    images.push({
      type: match[1].toLowerCase(),
      data: imageData,
      hash: hashImageData(imageData),
    });
  }
  return images;
};

/**
 * Save the extracted image as a file and return the image blob link.
 */
export const saveImage = async (image, userId) => {
  const normalizedType = image.type.toLowerCase() === "jpg" ? "jpeg" : image.type.toLowerCase();
  if (!ALLOWED_TYPES.has(normalizedType) && !ALLOWED_TYPES.has(image.type.toLowerCase())) {
    throw new AppError(400, `Unsupported image type: ${image.type}`);
  }
  const buffer = Buffer.from(image.data, "base64");
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new AppError(400, "Image too large (max 5MB)");
  }

  const userDir = resolveDataPath("images", userId.toString());
  const ext = normalizedType === "jpeg" ? "jpeg" : image.type.toLowerCase();
  const filename = `${userId}-${image.hash.substring(0, 8)}.${ext}`;
  const filepath = path.join(userDir, filename);

  await ensureDir(userDir);

  try {
    await fsPromises.writeFile(filepath, buffer);
    return `${env.BACKEND_ADDRESS}/article/images/${userId}/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new AppError(500, "Failed to save image.");
  }
};

/**
 * Replace the src attribute in <img> tags of the article body with their corresponding links
 */
export const replaceImages = (body, images) => {
  imageRegex.lastIndex = 0;
  return body.replace(imageRegex, (match, type, base64Data) => {
    const hash = hashImageData(base64Data);
    const image = images.find((img) => img.hash === hash);
    if (image) {
      return match.replace(/src="[^"]*"/, `src="${image.link}"`);
    }
    return match;
  });
};

/**
 * Process and save a base64 image and return its saved link.
 */
export const processAndSaveBase64Image = async (base64Image, userId) => {
  const imgTag = `<img src="${base64Image}" />`;
  const extractedImages = extractImages(imgTag);
  if (extractedImages.length === 0) {
    throw new Error("No images found in the provided base64 string.");
  }
  const savedImageLink = await saveImage(extractedImages[0], userId);
  return savedImageLink;
};

/**
 * Processes and saves the uploaded preview image in multiple resolutions.
 */
export const processAndSavePreviewImage = async (imageFile, userId, articleId) => {
  const basePath = resolveDataPath("images", userId.toString(), articleId.toString());

  try {
    await ensureDir(basePath);

    const masonry600 = `${userId}-m-600.jpg`;
    const masonry1200 = `${userId}-m-1200.jpg`;
    const featured2000 = `${userId}-f-2000.jpg`;
    const thumbs600 = `${userId}-t-600.jpg`;
    const thumbs1200 = `${userId}-t-1200.jpg`;
    const thumbs2400 = `${userId}-t-2400.jpg`;

    const masonryFilePath600 = path.join(basePath, masonry600);
    const masonryFilePath1200 = path.join(basePath, masonry1200);
    const featuredFilePath2000 = path.join(basePath, featured2000);
    const thumbsFilePath600 = path.join(basePath, thumbs600);
    const thumbsFilePath1200 = path.join(basePath, thumbs1200);
    const thumbsFilePath2400 = path.join(basePath, thumbs2400);

    sharp.cache(false);

    try {
      await Promise.all([
        sharp(imageFile.path).resize(600, 780).toFormat("jpeg").jpeg({ quality: 80 }).toFile(masonryFilePath600),
        sharp(imageFile.path).resize(1200, 1560).toFormat("jpeg").jpeg({ quality: 85 }).toFile(masonryFilePath1200),
      ]);
      await sharp(imageFile.path).resize(2000, 2600).toFormat("jpeg").jpeg({ quality: 95 }).toFile(featuredFilePath2000);
      await Promise.all([
        sharp(imageFile.path).resize(600, 338).toFormat("jpeg").jpeg({ quality: 80 }).toFile(thumbsFilePath600),
        sharp(imageFile.path).resize(1200, 675).toFormat("jpeg").jpeg({ quality: 85 }).toFile(thumbsFilePath1200),
        sharp(imageFile.path).resize(2400, 1350).toFormat("jpeg").jpeg({ quality: 90 }).toFile(thumbsFilePath2400),
      ]);
    } catch (sharpErr) {
      // Cleanup partial files on sharp failure
      await removeDir(basePath).catch(() => {});
      throw new AppError(400, `Invalid image: ${sharpErr.message}`);
    }

    try {
      await fsPromises.unlink(imageFile.path);
    } catch (err) {
      console.error("Error deleting temporary file:", err);
    }

    const masonryPaths = [
      `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${masonry600}`,
      `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${masonry1200}`,
    ];
    const featuredPaths = [`${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${featured2000}`];
    const thumbsPaths = [
      `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${thumbs600}`,
      `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${thumbs1200}`,
      `${env.BACKEND_ADDRESS}/article/images/${userId}/${articleId}/${thumbs2400}`,
    ];

    return {
      masonry: masonryPaths,
      featuredPaths: featuredPaths,
      thumbs: thumbsPaths,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error processing and saving preview image:", error);
    // Cleanup on any failure
    await removeDir(basePath).catch(() => {});
    throw new AppError(500, "Failed to process preview image");
  }
};

/**
 * Removes the folder containing article images for a specific user and article.
 */
export const removeImages = async (userId, articleId) => {
  try {
    const folderPath = resolveDataPath("images", userId.toString(), articleId.toString());
    const exists = await fsPromises
      .stat(folderPath)
      .then(() => true)
      .catch(() => false);
    if (exists) {
      await removeDir(folderPath);
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new AppError(500, "Failed to delete images.");
  }
};

/**
 * Processes and saves the uploaded avatar image.
 */
export const processAndSaveAvatarImage = async (imageFile, userId) => {
  const basePath = resolveDataPath("images", userId.toString(), "profile");

  try {
    await ensureDir(basePath);

    const profileAvatar = `${userId}-avatar.jpg`;
    const profileAvatarPath = path.join(basePath, profileAvatar);

    sharp.cache(false);
    try {
      await sharp(imageFile.path).resize(100, 100).toFormat("jpeg").jpeg({ quality: 90 }).toFile(profileAvatarPath);
    } catch (sharpErr) {
      throw new AppError(400, `Invalid avatar image: ${sharpErr.message}`);
    }

    try {
      await fsPromises.unlink(imageFile.path);
    } catch (err) {
      console.error("Error deleting temporary file:", err);
    }

    const imagePath = `${env.BACKEND_ADDRESS}/custom/avatars/${userId}/${profileAvatar}`;

    return {
      avatar: imagePath,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error processing and saving avatar image:", error);
    throw new AppError(500, "Failed to process avatar image");
  }
};
