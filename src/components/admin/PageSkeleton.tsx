// Squelette de chargement générique pour les pages admin.
// Affiché automatiquement par Next.js App Router via loading.tsx
// pendant qu'une Server Component se charge (fetch DB, auth, etc.).
// Styles inline Tailwind — pas de dépendance supplémentaire.

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded-lg animate-pulse ${className ?? ""}`}
      aria-hidden="true"
    />
  )
}

export default function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6" aria-busy="true" aria-label="Chargement…">
      {/* Titre */}
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonBlock className="h-4 w-72" />
      </div>

      {/* Contenu principal — deux colonnes */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Colonne gauche : formulaire */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-9 w-full" />
          <SkeletonBlock className="h-9 w-28" />
        </div>

        {/* Colonne droite : liste */}
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <SkeletonBlock className="h-4 w-48" />
                <SkeletonBlock className="h-5 w-16" />
              </div>
              <SkeletonBlock className="h-3 w-full" />
              <div className="flex gap-2 pt-1">
                <SkeletonBlock className="h-8 flex-1" />
                <SkeletonBlock className="h-8 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Variante pour les pages à colonne unique (dashboard, settings, activity)
export function PageSkeletonSingle() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6" aria-busy="true" aria-label="Chargement…">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
            <SkeletonBlock className="h-8 w-8 mx-auto" />
            <SkeletonBlock className="h-6 w-12 mx-auto" />
            <SkeletonBlock className="h-3 w-20 mx-auto" />
          </div>
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-48" />
            </div>
            <SkeletonBlock className="h-5 w-10" />
          </div>
        </div>
      ))}
    </div>
  )
}
