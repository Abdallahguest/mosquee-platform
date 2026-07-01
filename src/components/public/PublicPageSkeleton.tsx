// Squelette de chargement pour les pages publiques.
// Affiché automatiquement par Next.js App Router via loading.tsx
// pendant qu'une Server Component se charge.

function Block({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`} aria-hidden="true" />
}

export default function PublicPageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" aria-busy="true" aria-label="Chargement…">
      {/* Nav */}
      <div className="bg-green-800 h-14" />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-8">
          {/* Localisation */}
          <Block className="h-4 w-48" />

          {/* Tableau horaires */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <Block className="h-28 w-full rounded-none mb-0" />
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-3.5 flex justify-between">
                  <Block className="h-4 w-20" />
                  <Block className="h-5 w-14" />
                </div>
              ))}
            </div>
          </div>

          {/* Section annonces */}
          <div className="space-y-3">
            <Block className="h-5 w-32" />
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <Block className="h-4 w-48" />
                <Block className="h-3 w-full" />
                <Block className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// Variante légère pour les pages annonces/events
export function PublicListSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50" aria-busy="true" aria-label="Chargement…">
      <div className="bg-green-800 h-14" />
      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
          <Block className="h-6 w-40" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <Block className="h-4 w-48" />
              <Block className="h-3 w-full" />
              <Block className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
