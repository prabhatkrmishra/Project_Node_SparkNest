import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5143,
    proxy: {
      "/api": {
        target: process.env.VITE_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
        // Strip browser Origin/Referer so the API treats proxied calls as
        // server-to-server (the production API allowlists only the prod origin).
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");
          });
        },
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  base: "/",
  build: {
    sourcemap: true,
  },
});
