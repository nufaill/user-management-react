import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },    
  },
  server: {
    proxy: {
      "/api": "http://localhost:5010",
    },
  },
});
