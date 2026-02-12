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
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure single React instance to prevent hook dispatcher errors
    dedupe: ['react', 'react-dom'],
  },
  // Emit modern JavaScript for modern browsers only
  esbuild: {
    target: 'es2020', // Better mobile browser support
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    target: ['es2020', 'safari13', 'chrome90', 'firefox88', 'edge90'], // Mobile-first browser targets
    modulePreload: { polyfill: false },
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,
    sourcemap: mode === 'production' ? false : true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Critical React dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Critical UI components for initial render
          'vendor-ui-critical': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          // Secondary UI components (lazy load)
          'vendor-ui-secondary': ['@radix-ui/react-tabs', '@radix-ui/react-accordion', '@radix-ui/react-select', '@radix-ui/react-popover'],
          // Query library
          'vendor-query': ['@tanstack/react-query'],
          // Charts (lazy load for desktop analytics)
          'vendor-charts': ['recharts'],
          // Form handling
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Canvas library (desktop-only)
          'vendor-fabric': ['fabric']
        },
      },
    },
  },
}));
