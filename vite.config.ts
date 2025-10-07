import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  cacheDir: ".vite-cache",
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom",
      "react/jsx-runtime",
      "@radix-ui/react-menubar",
      "react-resizable-panels",
      "chroma-js"
    ],
    exclude: [],
    force: true
  },
}));
