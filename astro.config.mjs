// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'server',
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
