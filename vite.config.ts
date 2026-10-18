/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const DESCRIPTION =
  'Compose, schedule and manage posts for Facebook, Instagram, X and TikTok from one dashboard.'

/**
 * Social platforms ignore relative URLs in preview tags, so `__SITE_URL__` in
 * index.html is replaced with the deployed origin. On Vercel it is detected
 * automatically; elsewhere set VITE_SITE_URL. Without either, links stay
 * relative, which is fine for local development.
 */
function siteUrl(): Plugin {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url =
    process.env.VITE_SITE_URL ?? (vercelUrl ? `https://${vercelUrl}` : '')

  return {
    name: 'site-url',
    transformIndexHtml: (html) =>
      html.replaceAll('__SITE_URL__', url.replace(/\/$/, '')),
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    siteUrl(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Flintzy Scheduler',
        short_name: 'Flintzy',
        description: DESCRIPTION,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ecffe0',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The app shell is precached; the link-preview image is only for crawlers.
        globPatterns: ['**/*.{js,css,html,png,webp,svg}'],
        globIgnores: ['og-image.jpg'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Post images in the mock data (picsum redirects to fastly.picsum.photos)
            urlPattern: /^https:\/\/([a-z]+\.)?picsum\.photos\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'post-images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    env: { TZ: 'Asia/Kolkata' },
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
})
