import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getAllMosquesAdmin } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SuperAdminPage() {
  await requireSuperAdmin()
  const mosques = await getAllMosquesAdmin()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* En-tête : empilé sur mobile, en ligne sur écran large */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super-Admin</h1>
          <p className="text-gray-500 text-sm mt-1">{mosques.length} mosquée(s)</p>
        </div>
        {/* Boutons : pleine largeur en colonne sur mobile, compacts en ligne sur desktop */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/super-admin/users" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">👥 Comptes</Button>
          </Link>
          <Link href="/super-admin/mosques/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-green-700 hover:bg-green-800">+ Nouvelle mosquée</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {mosques.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune mosquée. Créez la première.</p>
        ) : (
          mosques.map((m) => (
            <Card key={m.id}>
              {/* Ligne : infos au-dessus, actions en dessous sur mobile ; côte à côte sur desktop */}
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    {m.isVerified && <Badge variant="secondary">✓ Vérifiée</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 wrap-break-word">
                    {m.city}, {m.country} · /{m.slug}
                  </p>
                </div>
                {/* Actions : pleine largeur répartie sur mobile, compactes sur desktop */}
                <div className="flex gap-2 shrink-0">
                  <Link href={`/m/${m.slug}`} className="flex-1 sm:flex-none">
                    <Button variant="ghost" size="sm" className="w-full sm:w-auto">Voir</Button>
                  </Link>
                  <Link href={`/super-admin/mosques/${m.id}/edit`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Modifier</Button>
                  </Link>
                  <Link href={`/super-admin/mosques/${m.id}/admins`} className="flex-1 sm:flex-none">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Admins</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
