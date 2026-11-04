import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Caching strategy from the handoff: network-first (8 s) for forecast data, cache-first for fonts/libs,
// precached app shell, and never cache keyed APIs (TomTom, Mapbox) or cams.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      injectRegister: null,
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: '2CA — Surf + Snow + CA Double',
        short_name: '2CA',
        description: 'Live surf, snow and California Double planner for Southern California.',
        start_url: './?app=1',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F2F0EB',
        theme_color: '#080D14',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['**/hls-*.js'], // hls.js loads on demand; live video needs a network anyway
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /open-meteo\.com|tidesandcurrents\.noaa\.gov|cwwp2\.dot\.ca\.gov\/data\/d\d\/cc\/|router\.project-osrm\.org/,
            handler: 'NetworkFirst',
            options: { cacheName: 'lineup-data', networkTimeoutSeconds: 8, expiration: { maxEntries: 60, maxAgeSeconds: 3 * 86400 }, cacheableResponse: { statuses: [200] } },
          },
        ],
      },
    }),
  ],
});
