import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/FitnessApp/',
  plugins: [
    react(),
    VitePWA({
      // "autoUpdate" heißt: der Service Worker holt sich neue
      // Versionen automatisch, ohne dass der Nutzer manuell
      // etwas bestätigen muss.
      registerType: 'autoUpdate',

      // Diese Dateien landen zusätzlich im public-Ordner
      // und werden immer mitausgeliefert.
      includeAssets: ['favicon.ico'],

      manifest: {
        name: 'Do it anyway.',
        short_name: 'DIA',
        description: 'Fitness-App: Gym und Laufen in einem Plan.',
        theme_color: '#080d19',
        background_color: '#080d19',
        display: 'standalone',
        start_url: '/FitnessApp/',
        scope: '/FitnessApp/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})