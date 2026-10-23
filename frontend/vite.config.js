import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the domain root (pilotconstract.com on GitHub Pages), so the default base "/" is right.
// The second build (`--ssr`, see package.json) renders the pages to HTML for search engines (scripts/prerender.mjs);
// it must not copy the public/ folder (gallery photos) a second time.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: { copyPublicDir: !isSsrBuild },
}));
