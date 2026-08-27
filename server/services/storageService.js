import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function getDataRoot() {
  const raw = process.env.DATA_ROOT || "./data";
  return path.isAbsolute(raw) ? raw : path.resolve(projectRoot, raw);
}

export const DATA_ROOT = getDataRoot();

export const resolveDataPath = (...segments) => path.join(DATA_ROOT, ...segments);

export const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });

export const removeDir = async (dir) => fs.rm(dir, { recursive: true, force: true });
