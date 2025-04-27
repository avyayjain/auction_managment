import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(),
  tailwindcss()],
  server: {
    port: 5173,   // You can change the port if needed
    open: true,   // Automatically open browser when server starts
  },
  resolve: {
    alias: {
      '@': '/templates',  // if your code is inside templates/ instead of src/
    },
  },
});
