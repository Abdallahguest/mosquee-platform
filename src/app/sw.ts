import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist"

// Déclare la valeur de `injectionPoint` pour TypeScript.
// `self.__SW_MANIFEST` est remplacé au build par la liste réelle des fichiers à précacher.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // ── PAGES (navigations) : NetworkFirst ──
    // On tente TOUJOURS le réseau d'abord (horaires/annonces frais).
    // On ne sert le cache QUE si le réseau échoue (hors-ligne).
    // Aligné anti-gharar : jamais de contenu périmé affiché tant qu'il y a du réseau.
    {
      matcher({ request }) {
        return request.mode === "navigate"
      },
      handler: new NetworkFirst({
        cacheName: "pages",
        // 3s : en réseau très lent, on bascule vite sur le cache plutôt que faire attendre.
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            // On garde au plus 50 pages récemment consultées (anti-israf).
            maxEntries: 50,
            // Et au plus 7 jours : au-delà, le contenu est trop vieux pour être servi.
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // ── Le reste (assets, données RSC, etc.) : comportement par défaut serwist ──
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        // Page de repli affichée UNIQUEMENT pour une navigation (document)
        // qui n'est ni en réseau ni en cache. Une page déjà visitée est
        // servie depuis le cache "pages", pas remplacée par ce repli.
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()
