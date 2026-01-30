import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: false,
    hmr: {
      // Let Vite auto-detect the correct host
      port: 5173,
    },
    watch: {
      // Prevent watching unnecessary files that trigger reloads
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    proxy: {
      // Proxy API calls to backend during development to avoid CORS
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
