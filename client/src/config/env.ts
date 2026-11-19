export const env = {
  // Relative by default: the Vite dev proxy and the production nginx both
  // expose the API under /api, so the bundle works without a build-time URL.
  apiUrl: (import.meta.env.VITE_API_URL as string) || "/api",
  appName: (import.meta.env.VITE_APP_NAME as string) || "SparkNest",
};

if (!env.apiUrl) {
  throw new Error("VITE_API_URL is not defined");
}
