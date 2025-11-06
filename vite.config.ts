import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isElectron = process.env.ELECTRON === 'true';
  
  return {
    base: isElectron ? './' : '/',
    
    server: {
      host: "::",
      port: 8080,
    },
    
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Critical: Dedupe React to prevent multiple instances
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom"],
  },
  
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "react/jsx-runtime", 
      "react-router-dom",
      "react-router"
    ],
    exclude: [],
    force: true, // Force re-optimization
  },
    
    build: {
      outDir: isElectron ? 'dist-electron' : 'dist',
      rollupOptions: {
        external: isElectron ? ['electron'] : [],
      },
    },
  };
});
