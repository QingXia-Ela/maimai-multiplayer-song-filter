import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 设为相对路径以适应 GitHub Pages 部署
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
      ],
      manifest: {
        name: 'MaiMai 多人选歌器',
        short_name: 'MaiMai 选歌器',
        description: '根据两位玩家的定数范围，推荐适合拼机游玩的舞萌 DX 曲目。',
        lang: 'zh-CN',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/maimai\.lxns\.net\/api\/v0\/maimai\/song\/list/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lxns-song-list',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/www\.diving-fish\.com\/api\/maimaidxprober\/chart_stats/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'diving-fish-chart-stats',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 7 * 24 * 60 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/(?:assets2\.lxns\.net\/maimai\/jacket|www\.diving-fish\.com\/covers)\//i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'maimai-song-covers',
              expiration: {
                maxEntries: 1500,
                maxAgeSeconds: 90 * 24 * 60 * 60,
                purgeOnQuotaError: true,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
