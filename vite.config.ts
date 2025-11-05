import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // For Electron, use relative paths
  base: process.env.ELECTRON === 'true' ? './' : '/',
  
  server: {
    host: "::",
    port: 8080,
  },
  
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
    ],
    esbuildOptions: {
      target: 'esnext',
    },
    // Exclude Electron from optimization
    exclude: ['electron'],
  },
  
  build: {
    // Output directory for Electron
    outDir: process.env.ELECTRON === 'true' ? 'dist-electron' : 'dist',
    
    // Electron compatibility
    target: process.env.ELECTRON === 'true' ? 'esnext' : 'modules',
    
    // Don't minify in Electron dev mode for better debugging
    minify: process.env.ELECTRON === 'true' && mode === 'development' ? false : 'esbuild',
    
    commonjsOptions: {
      include: [/node_modules/],
    },
    
    rollupOptions: {
      // External Electron modules
      external: process.env.ELECTRON === 'true' ? ['electron'] : [],
    },
  },
}));
