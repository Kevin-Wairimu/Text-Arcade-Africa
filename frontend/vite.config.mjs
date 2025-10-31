import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // ✅ Base path ensures assets load correctly on Netlify or any subpath
  base: "/",

  server: {
    port: 5173,
    open: true,
  },

  // ✅ Build settings
  build: {
    outDir: "dist",
    emptyOutDir: true, // Clears previous build before new one
  },

  // ✅ Fallback for React Router (handled by Netlify too, but helps local dev)
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
