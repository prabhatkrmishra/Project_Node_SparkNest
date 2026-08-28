export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string) || "http://localhost:3000",
  appName: (import.meta.env.VITE_APP_NAME as string) || "SparkNest",
};

if (!env.apiUrl) {
  throw new Error("VITE_API_URL is not defined");
}
