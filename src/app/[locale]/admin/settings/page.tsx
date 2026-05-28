import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMosqueById, getAllMosques } from "@/db/queries"
import MosqueSettingsForm from "@/components/admin/MosqueSettingsForm"
import ExportButton from "@/components/admin/ExportButton"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const allMosques = await getAllMosques()
  const mosqueId = allMosques.length > 0 ? allMosques[0].id : 1
  const mosque = await getMosqueById(mosqueId)
  
  if (!mosque) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700">Aucune mosquée trouvée. Veuillez exécuter le seed.</p>
          <code className="text-xs bg-red-100 px-2 py-1 rounded mt-2 inline-block">pnpm db:seed</code>
        </div>
      </div>
    )
  }

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
