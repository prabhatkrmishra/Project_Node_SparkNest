import config from "../config/config.js";
import fs from "fs";
import { promises as fsPromises } from "fs";
import path from "path";
import sharp from "sharp";
import { createHash } from "crypto";

//const imageRegex = /<img src="data:image\/([a-zA-Z]+);base64,([a-zA-Z0-9+/=]*)"[^>]*>/g;
const imageRegex =
  /<img src="data:image\/([a-zA-Z]+);base64,([a-zA-Z0-9+/=]*)"[^>]*>/g;

const hashImageData = (data) => {
  const hash = createHash("sha256");
  hash.update(data);
  return hash.digest("hex");
};

/**
 * Extract the images from the article body.
 *
 * @param {string} articleBody - The article content containing base64 images.
 * @returns {Array<{type: string, data: string}>} - Array with the extracted images.
 */
export const extractImages = (articleBody) => {
  const images = [];
  let match;

  try {
    while ((match = imageRegex.exec(articleBody)) !== null) {
      const imageData = match[2];
      images.push({
        type: match[1],
        data: imageData,
        hash: hashImageData(imageData),
      });
    }
    return images;
  } catch (error) {
    throw error;
  }
};

/**
 * Save the extracted image as a file and return the image blob link.
 *
 * @param {Object} image - An object containing image data.
 * @param {string} image.type - The type of the image (e.g., "jpeg").
 * @param {string} image.data - The base64 encoded image data.
 * @param {string} image.hash - The SHA-256 hash of the image data.
 * @param {number} userId - The user's id.
 * @returns {Promise<string>} - Image blob link.
 */
export const saveImage = (image, userId) => {
  const userDir = path.join(
    process.cwd(),
    "..",
    "..",
    "data",
    "images",
    userId.toString()
  );

  const filename = `${userId}-${image.hash.substring(0, 8)}.${image.type}`;
  const filepath = path.join(userDir, filename);

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  try {
    fs.writeFileSync(filepath, Buffer.from(image.data, "base64"));
    return `${config.backendAddress}/article/images/${userId}/${filename}`;
  } catch (error) {
    console.error("Error saving image:", error);
    throw new Error("Failed to save image.");
  }
};

/**
 * Replace the src attribute in <img> tags of
 * the article body with their corresponding links
 *
 * @param {string} body - The article body
 * @param {Array} images - Array containing image data
 * @returns {Promise<string>} - Sanitized article body
 */
export const replaceImages = (body, images) => {
  /* The regex finds the <img> tag in the body.
   * The base64 data from the tag is hashed.
   * The hash is compared to the hashes in the images array.
   * If a matching hash is found, src attribute of the <img>
   * * * is replaced with mached hash image link.
   * If no match is found, the original src attribute remains unchanged.
   *
   * Hence preventing duplicate image generation.
   */
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
 *
 * @param {string} base64Image - The base64 encoded image string.
 * @param {number} userId - The user's ID.
 * @returns {Promise<string>} - The link to the saved image.
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
 *
 * @param {Object} imageFile - The image file object from multer
 * @param {number} userId - The ID of the user uploading the image
 * @param {number} articleId - The Article id for preview image
 * @returns {Promise<Object|null>} - An array containing paths (600, 1200, and 2000x2600).
 *
 * This function:
 * 1. Takes the uploaded image file (stored temporarily by multer).
 * 2. Resizes the image to predefined resolutions (600x400, 1200x800, and 2000x2600).
 * 3. Saves the resized images in user-specific directories.
 * 4. Returns an array of file paths to the saved images.
 */
export const processAndSavePreviewImage = async (
  imageFile,
  userId,
  articleId
) => {
  try {
    const basePath = path.join(
      process.cwd(),
      "..",
      "..",
      "data",
      "images",
      userId.toString(),
      articleId.toString()
    );

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // Masonary
    const masonry600 = `${userId}-m-600.jpg`;
    const masonry1200 = `${userId}-m-1200.jpg`;
    // Featured
    const featured2000 = `${userId}-f-2000.jpg`;
    // Thumbs
    const thumbs600 = `${userId}-t-600.jpg`;
    const thumbs1200 = `${userId}-t-1200.jpg`;
    const thumbs2000 = `${userId}-t-2000.jpg`;

    // Masonary
    const masonryFilePath600 = path.join(basePath, masonry600);
    const masonryFilePath1200 = path.join(basePath, masonry1200);
    // Featured
    const featuredFilePath2000 = path.join(basePath, featured2000);
    // Thumbs
    const thumbsFilePath600 = path.join(basePath, thumbs600);
    const thumbsFilePath1200 = path.join(basePath, thumbs1200);
    const thumbsFilePath2000 = path.join(basePath, thumbs2000);

    sharp.cache(false);
    // For Masonry
    await Promise.all([
      sharp(imageFile.path)
        .resize(600, 780)
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toFile(masonryFilePath600),

      sharp(imageFile.path)
        .resize(1200, 1560)
        .toFormat("jpeg")
        .jpeg({ quality: 85 })
        .toFile(masonryFilePath1200),
    ]);
    // For Featured
    await Promise.all([
      sharp(imageFile.path)
        .resize(2000, 2600)
        .toFormat("jpeg")
        .jpeg({ quality: 85 })
        .toFile(featuredFilePath2000),
    ]);
    // For Thumbs
    await Promise.all([
      sharp(imageFile.path)
        .resize(600, 338)
        .toFormat("jpeg")
        .jpeg({ quality: 80 })
        .toFile(thumbsFilePath600),

      sharp(imageFile.path)
        .resize(1200, 675)
        .toFormat("jpeg")
        .jpeg({ quality: 85 })
        .toFile(thumbsFilePath1200),

      sharp(imageFile.path)
        .resize(2000, 1350)
        .toFormat("jpeg")
        .jpeg({ quality: 85 })
        .toFile(thumbsFilePath2000),
    ]);

    // Delete original image
    try {
      await fsPromises.unlink(imageFile.path);
      console.log("Temporary file deleted successfully.");
    } catch (err) {
      console.error("Error deleting temporary file:", err);
    }

    const masonryPaths = [
      `${config.backendAddress}/article/images/${userId}/${articleId}/${masonry600}`,
      `${config.backendAddress}/article/images/${userId}/${articleId}/${masonry1200}`,
    ];

    const featuredPaths = [
      `${config.backendAddress}/article/images/${userId}/${articleId}/${featured2000}`,
    ];

    const thumbsPaths = [
      `${config.backendAddress}/article/images/${userId}/${articleId}/${thumbs600}`,
      `${config.backendAddress}/article/images/${userId}/${articleId}/${thumbs1200}`,
      `${config.backendAddress}/article/images/${userId}/${articleId}/${thumbs2000}`,
    ];

    return {
      masonry: masonryPaths,
      featuredPaths: featuredPaths,
      thumbs: thumbsPaths,
    };
  } catch (error) {
    console.error("Error processing and saving preview image:", error);
    return null;
  }
};

/**
 * Removes the folder containing article images for a specific user and article.
 *
 * @param {number} userId - The ID of the user.
 * @param {number} articleId - The ID of the article.
 * @returns {Promise<void>}
 */
export const removeImages = async (userId, articleId) => {
  try {
    const folderPath = path.join(
      process.cwd(),
      "..",
      "..",
      "data",
      "images",
      userId.toString(),
      articleId.toString()
    );

    if (fs.existsSync(folderPath)) {
      await fsPromises.rm(folderPath, { recursive: true });
      console.log(`Folder deleted: ${folderPath}`);
    } else {
      console.log(`Folder not found: ${folderPath}`);
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Failed to delete images.");
  }
};

/**
 * Processes and saves the uploaded preview image in multiple resolutions.
 *
 * @param {Object} imageFile - The image file object from multer
 * @param {number} userId - The ID of the user uploading the image
 * @returns {Promise<Object|null>} - path of avatar image.
 *
 */
export const processAndSaveAvatarImage = async (
  imageFile,
  userId
) => {
  try {
    const basePath = path.join(
      process.cwd(),
      "..",
      "..",
      "data",
      "images",
      userId.toString(),
      "profile",
    );

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const profileAvatar = `${userId}-avatar.jpg`;
    const profileAvatarPath = path.join(basePath, profileAvatar);

    sharp.cache(false);
    await sharp(imageFile.path)
        .resize(100, 100)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(profileAvatarPath);

    // Delete original image
    try {
      await fsPromises.unlink(imageFile.path);
      console.log("Temporary file deleted successfully.");
    } catch (err) {
      console.error("Error deleting temporary file:", err);
    }

    const imagePath = `${config.backendAddress}/custom/avatars/${userId}/${profileAvatar}`;

    return {
      avatar: imagePath
    };
  } catch (error) {
    console.error("Error processing and saving avatar image:", error);
    return null;
  }
};