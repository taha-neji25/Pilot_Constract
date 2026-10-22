import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the domain root (pilotconstract.com on GitHub Pages), so the default base "/" is right.
export default defineConfig({
  plugins: [react()],
});
