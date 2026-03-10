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
    sourcemap: false, // Disable sourcemaps in production to save space
    minify: 'esbuild', // Fast and aggressive minification
    target: 'esnext', // Use modern JS syntax for smaller bundle sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into smaller parallel downloads
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'recharts'],
          'vendor-utils': ['axios', 'jspdf', 'html2canvas', 'socket.io-client']
        }
      }
    }
  },

  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
