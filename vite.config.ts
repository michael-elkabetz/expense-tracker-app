import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  // Set base path for GitHub Pages deployment
  // GitHub Pages serves from /repo-name/ path
  const base = process.env.GITHUB_PAGES_BASE || process.env.BASE_URL || '/';
  
  return {
    base,
  server: {
    host: "::",
    port: 80,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  };
});
