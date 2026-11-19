import multer from "multer";
import path from "path";
import { ensureDir, UPLOAD_TMP_DIR } from "../services/storageService.js";
import { AppError } from "./errorMiddleware.js";

const MAX_FILENAME_LENGTH = 120;

/**
 * Keep only the final path component and a safe character set. The temp file
 * is renamed later by sharp, so the original name is only used for debugging.
 */
function safeFilename(originalname) {
  const base = path.basename(String(originalname || "upload"));
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-MAX_FILENAME_LENGTH);
}

/**
 * Multer instance for image uploads. The temp directory is created on demand
 * because DATA_ROOT may be an empty volume on first boot.
 */
export function createImageUpload({ maxFileSize }) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        ensureDir(UPLOAD_TMP_DIR).then(
          () => cb(null, UPLOAD_TMP_DIR),
          (err) => cb(err)
        );
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${safeFilename(file.originalname)}`);
      },
    }),
    limits: {
      fileSize: maxFileSize,
      fieldSize: maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new AppError(400, "Only images allowed"), false);
      }
      cb(null, true);
    },
  });
}
