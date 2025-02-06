// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [react()],
  define: {
    'global': {},
    'process.env': {},
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      buffer: "buffer"
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
});