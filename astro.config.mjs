// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import { VitePWA } from 'vite-plugin-pwa';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'server',
  vite: {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'favicon.svg', 'logo.jpeg'],
        manifest: {
          name: 'Barbara Toffano',
          short_name: 'Barbara',
          description:
            'Tarologia e lettura carte con Barbara Toffano. Shop online, consulti e percorsi personalizzati.',
          theme_color: '#12081f',
          background_color: '#12081f',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          lang: 'it',
          categories: ['lifestyle', 'health', 'shopping'],
          icons: [
            {
              src: '/icons/pwa-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icons/pwa-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,woff2}'],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  },
  adapter: node({
    mode: 'standalone',
  }),
  // Astro SSR: di default blocca POST con Content-Type da form se `Origin !== url.origin`.
  // Dietro reverse proxy (Coolify, Traefik, Nginx) spesso `url` è interno (es. http://container)
  // mentre il browser invia `Origin` pubblico → 403 “Cross-site POST form submissions are forbidden”.
  security: {
    checkOrigin:
      process.env.ASTRO_SECURITY_CHECK_ORIGIN === '1' ||
      process.env.ASTRO_SECURITY_CHECK_ORIGIN === 'true',
  },
});
