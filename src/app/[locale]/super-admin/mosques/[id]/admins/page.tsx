import { notFound } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getMosqueById, getMosqueAdmins, getUsersNotAdminOfMosque } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AssignAdminForm from "@/components/superadmin/AssignAdminForm"
import RemoveAdminButton from "@/components/superadmin/RemoveAdminButton"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MosqueAdminsPage({ params }: PageProps) {
  await requireSuperAdmin()
  const { id } = await params
  const mosqueId = Number(id)

  const mosque = await getMosqueById(mosqueId)
  if (!mosque) notFound()

  const [admins, assignable] = await Promise.all([
    getMosqueAdmins(mosqueId),
    getUsersNotAdminOfMosque(mosqueId),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/super-admin/mosques" className="text-sm text-gray-400 hover:text-gray-600">
        ← Retour aux mosquées
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-1">Admins de {mosque.name}</h1>
      <p className="text-gray-500 text-sm mb-8">Gérez qui peut administrer cette mosquée</p>

      {/* Assigner un admin */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Ajouter un admin</CardTitle>
        </CardHeader>
        <CardContent>
          {assignable.length === 0 ? (
            <p className="text-sm text-gray-400">
              Tous les comptes sont déjà admins de cette mosquée, ou aucun compte n&apos;existe.
              Créez d&apos;abord un compte dans la page Comptes.
            </p>
          ) : (
            <AssignAdminForm mosqueId={mosqueId} candidates={assignable} />
          )}
        </CardContent>
      </Card>

      {/* Admins actuels */}
      <h2 className="font-semibold text-gray-900 mb-3">
        Admins actuels ({admins.length})
      </h2>
      {admins.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">
          Aucun admin assigné. Cette mosquée n&apos;est pas encore administrée.
        </p>
      ) : (
        <div className="space-y-2">
          {admins.map((a) => (
            <Card key={a.linkId}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{a.name}</span>
                  <p className="text-sm text-gray-500">{a.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.role === "super_admin" && <Badge className="bg-purple-600">super-admin</Badge>}
                  <RemoveAdminButton mosqueId={mosqueId} userId={a.userId} userName={a.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
