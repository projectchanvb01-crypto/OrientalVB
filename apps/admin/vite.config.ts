import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// apps/admin — Oriental Backoffice
// Desktop-Only | Online Required | Port 3003
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  server: {
    port: 3003,
    host: true,
  },
});
