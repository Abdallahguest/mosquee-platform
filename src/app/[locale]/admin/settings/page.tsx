import { requireSession } from "@/lib/auth-helpers"
import { getMosqueById } from "@/db/queries"
import MosqueSettingsForm from "@/components/admin/MosqueSettingsForm"
import ExportButton from "@/components/admin/ExportButton"
import NoMosque from "@/components/admin/NoMosque"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const session = await requireSession()
  const mosqueId = session.user.mosqueId
  if (mosqueId == null) return <NoMosque />

  const mosque = await getMosqueById(mosqueId)
  if (!mosque) return <NoMosque />

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configuration de votre mosquée
        </p>
      </div>
      <MosqueSettingsForm mosque={mosque} />
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Vos données</CardTitle>
          <CardDescription>
            Téléchargez l&apos;ensemble de vos données à tout moment.
            Vos données vous appartiennent — aucune rétention forcée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton mosqueId={mosque.id} mosqueSlug={mosque.slug} />
        </CardContent>
      </Card>
    </div>
  )
}
