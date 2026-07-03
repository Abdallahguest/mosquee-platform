import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getAllMosquesAdmin } from "@/db/queries"
import { selectMosque } from "@/lib/actions/select-mosque.actions"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Page réservée au super-admin : choisir quelle mosquée gérer dans le panel admin.
export default async function SelectMosquePage() {
  await requireSuperAdmin()
  const mosques = await getAllMosquesAdmin()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Choisir une mosquée à gérer
        </h1>
        <p className="text-gray-500 text-sm">
          Sélectionnez la mosquée dont vous voulez gérer le contenu (annonces, événements, horaires, membres).
        </p>
      </div>

      {mosques.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
          <p>Aucune mosquée créée. Créez-en une depuis le super-admin.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mosques.map((mosque) => (
            <form key={mosque.id} action={selectMosque.bind(null, mosque.id)}>
              <button
                type="submit"
                className="w-full text-start"
              >
                <Card className="hover:shadow-md hover:border-green-300 transition-all cursor-pointer">
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{mosque.name}</span>
                        {mosque.isVerified && (
                          <Badge variant="secondary" className="text-xs">✓ Vérifiée</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {mosque.city}, {mosque.country} · /{mosque.slug}
                      </p>
                    </div>
                    <span className="text-green-700 shrink-0" aria-hidden="true">→</span>
                  </CardContent>
                </Card>
              </button>
            </form>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-8 text-center">
        Cette page est uniquement accessible au super-administrateur.
      </p>
    </div>
  )
}
