import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openApiPath = path.join(__dirname, "../docs/openapi.yaml");

router.get("/docs", (_req, res) => {
  try {
    const yaml = fs.readFileSync(openApiPath, "utf-8");
    res.type("text/yaml").send(yaml);
  } catch {
    res.status(404).json({ message: "OpenAPI docs not found" });
  }
});

router.get("/docs.json", (_req, res) => {
  try {
    const yaml = fs.readFileSync(openApiPath, "utf-8");
    // Simple: return yaml as text; clients can parse
    res.type("application/json").json({ yaml });
  } catch {
    res.status(404).json({ message: "OpenAPI docs not found" });
  }
});

export default router;
