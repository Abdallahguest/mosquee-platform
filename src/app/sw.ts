import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"

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
  // defaultCache : stratégie optimisée App Router (pages, RSC, assets).
  // Ouverture instantanée depuis le cache, rafraîchissement en arrière-plan.
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        // Page de repli affichée UNIQUEMENT pour une navigation (document)
        // qui n'est ni en réseau ni en cache. Une page déjà visitée est
        // servie depuis le cache, pas remplacée par ce repli.
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()
