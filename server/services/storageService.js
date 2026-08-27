import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export const DATA_ROOT = path.isAbsolute(env.DATA_ROOT)
  ? env.DATA_ROOT
  : path.resolve(projectRoot, env.DATA_ROOT);

export const resolveDataPath = (...segments) => path.join(DATA_ROOT, ...segments);

export const ensureDir = async (dir) => fs.mkdir(dir, { recursive: true });

export const removeDir = async (dir) => fs.rm(dir, { recursive: true, force: true });
