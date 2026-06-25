import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist, NetworkFirst, ExpirationPlugin } from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const ORIGIN = self.location.origin

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Pages & navigations : NetworkFirst (réseau d'abord, cache en secours).
    {
      matcher({ request, url }) {
        if (url.origin !== ORIGIN) return false
        const isNavigation = request.mode === "navigate"
        const isRSC = request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch")
        const isDocument = request.destination === "document"
        return isNavigation || isRSC || isDocument
      },
      handler: new NetworkFirst({
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        // Page de repli : notre VRAIE page /offline (route Next normale,
        // précachée ci-dessous via additionalPrecacheEntries dans next.config).
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()
