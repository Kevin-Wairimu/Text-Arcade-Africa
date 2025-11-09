import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/",

  server: {
    port: 5173,
    open: true,
    // ✅ This enables SPA routing fallback
    historyApiFallback: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
