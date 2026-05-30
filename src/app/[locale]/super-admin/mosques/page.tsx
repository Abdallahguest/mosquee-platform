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
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super-Admin</h1>
          <p className="text-gray-500 text-sm mt-1">{mosques.length} mosquée(s)</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/users">
            <Button variant="outline">👥 Comptes</Button>
          </Link>
          <Link href="/super-admin/mosques/new">
            <Button className="bg-green-700 hover:bg-green-800">+ Nouvelle mosquée</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {mosques.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Aucune mosquée. Créez la première.</p>
        ) : (
          mosques.map((m) => (
            <Card key={m.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    {m.isVerified && <Badge variant="secondary">✓ Vérifiée</Badge>}
                  </div>
                  <p className="text-sm text-gray-500">
                    {m.city}, {m.country} · /{m.slug} · admin : {m.adminEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/m/${m.slug}`}>
                    <Button variant="ghost" size="sm">Voir</Button>
                  </Link>
                  <Link href={`/super-admin/mosques/${m.id}/edit`}>
                    <Button variant="outline" size="sm">Modifier</Button>
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
