import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// apps/pos — Oriental POS Terminal
// PWA Tablet/PC | Offline-First Kasir | Port 3001
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Oriental POS Terminal',
        short_name: 'OrientalPOS',
        description: 'Terminal Kasir PWA Offline-First — Retail, Grosir & Waste',
        theme_color: '#059669',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        // Offline-first strategy untuk POS kasir
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: { cacheName: 'pos-images-cache', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
          },
          {
            // API calls: NetworkFirst agar data harga & stok selalu segar
            urlPattern: /^http:\/\/localhost:4000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'pos-api-cache', expiration: { maxEntries: 200, maxAgeSeconds: 5 * 60 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
  server: {
    port: 3001,
    host: true,
  },
});
