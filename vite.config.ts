import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the production build can be opened from any path
  // (file://, a subfolder deploy, or the render-gate's static server).
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1200, // the guide is one large module pre-split
  },
});
