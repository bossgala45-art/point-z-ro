import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'
import { buildIcs, type ReminderKind } from './src/shared/reminders'

// Le site est servi sur https://<utilisateur>.github.io/point-z-ro/
const base = '/point-z-ro/'
const appUrl = `https://bossgala45-art.github.io${base}`

// Génère les fichiers de rappel pour le Calendrier de l'iPhone (un par tranche de 5 minutes).
function reminderFiles(): Plugin {
  return {
    name: 'point-zero-reminders',
    apply: 'build',
    generateBundle() {
      for (const kind of ['matin', 'midi', 'soir'] as ReminderKind[]) {
        for (let t = 0; t < 24 * 60; t += 5) {
          const hhmm = String(Math.floor(t / 60)).padStart(2, '0') + String(t % 60).padStart(2, '0')
          this.emitFile({ type: 'asset', fileName: `rappels/${kind}-${hhmm}.ics`, source: buildIcs(kind, hhmm, appUrl) })
        }
      }
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    react(),
    reminderFiles(),
    VitePWA({
      registerType: 'autoUpdate',
      // Les fichiers de rappel doivent arriver tels quels, pas remplacés par l'appli.
      workbox: { navigateFallbackDenylist: [/\/rappels\//] },
      includeAssets: ['apple-touch-icon.png', 'favicon.svg'],
      manifest: {
        name: 'Point Zéro',
        short_name: 'Point Zéro',
        description: 'Ton appli de reconstruction : sommeil, école, sport, moral.',
        lang: 'fr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e1014',
        theme_color: '#0e1014',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
