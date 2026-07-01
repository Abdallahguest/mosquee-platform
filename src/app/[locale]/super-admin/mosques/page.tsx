import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getAllMosquesAdmin, getMosqueDeletionStats } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DeleteMosqueButton from "@/components/superadmin/DeleteMosqueButton"

const PER_PAGE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function SuperAdminMosquesPage({ searchParams }: PageProps) {
  await requireSuperAdmin()

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const allMosques = await getAllMosquesAdmin()
  const total = allMosques.length
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const mosques = allMosques.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const statsByMosque = new Map(
    await Promise.all(
      mosques.map(async (m) => [m.id, await getMosqueDeletionStats(m.id)] as const)
    )
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Super-Admin</h1>
          <p className="text-gray-500 text-sm mt-1">{total} mosquée(s)</p>
        </div>
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
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.name}</span>
                    {m.isVerified && <Badge variant="secondary">✓ Vérifiée</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 break-words">
                    {m.city}, {m.country} · /{m.slug}
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:items-end shrink-0">
                  <div className="flex gap-2">
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
                  <DeleteMosqueButton
                    mosqueId={m.id}
                    mosqueName={m.name}
                    stats={statsByMosque.get(m.id) ?? { announcements: 0, events: 0, members: 0, admins: 0 }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm">
          {page > 1 ? (
            <Link href={{ pathname: "/super-admin/mosques", query: { page: page - 1 } }} className="text-green-700 hover:underline">
              ← Précédent
            </Link>
          ) : <span />}
          <span className="text-gray-500">Page {page} / {totalPages}</span>
          {page < totalPages ? (
            <Link href={{ pathname: "/super-admin/mosques", query: { page: page + 1 } }} className="text-green-700 hover:underline">
              Suivant →
            </Link>
          ) : <span />}
        </div>
      )}
    </div>
  )
}
