import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

// URL de l'origine du site (pour ne mettre en cache que NOS pages).
const ORIGIN = self.location.origin

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // ── PAGES & contenu de navigation : NetworkFirst ──
    // Matcher élargi : on capture aussi bien les navigations classiques
    // (request.mode === "navigate") que les requêtes RSC de Next.js
    // (en-tête "RSC") et les documents de même origine. C'est ce qui
    // permet à la page de s'afficher hors-ligne après une visite en ligne.
    {
      matcher({ request, url }) {
        const sameOrigin = url.origin === ORIGIN
        if (!sameOrigin) return false
        const isNavigation = request.mode === "navigate"
        const isRSC = request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch")
        const isDocument = request.destination === "document"
        return isNavigation || isRSC || isDocument
      },
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // ── Le reste (assets, etc.) : comportement par défaut serwist ──
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()
