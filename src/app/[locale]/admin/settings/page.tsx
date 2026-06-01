import { getSessionMosque } from "@/lib/auth-helpers"
import MosqueSettingsForm from "@/components/admin/MosqueSettingsForm"
import PrayerTimesForm from "@/components/admin/PrayerTimesForm"
import ExportButton from "@/components/admin/ExportButton"
import NoMosque from "@/components/admin/NoMosque"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">
          Configuration de votre mosquée
        </p>
      </div>

      {/* Horaires de prière — en haut, le plus visible (Bug A : saisie possible) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Horaires de prière</CardTitle>
          <CardDescription>
            Saisissez les heures réelles affichées dans votre mosquée.
            Ce sont elles qui apparaissent sur la page publique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PrayerTimesForm
            mosqueId={mosque.id}
            initial={{
              fajrAdhan: mosque.fajrAdhan,       fajrIqama: mosque.fajrIqama,
              dhuhrAdhan: mosque.dhuhrAdhan,     dhuhrIqama: mosque.dhuhrIqama,
              asrAdhan: mosque.asrAdhan,         asrIqama: mosque.asrIqama,
              maghribAdhan: mosque.maghribAdhan, maghribIqama: mosque.maghribIqama,
              ishaAdhan: mosque.ishaAdhan,       ishaIqama: mosque.ishaIqama,
              jumuaAdhan: mosque.jumuaAdhan,     jumuaIqama: mosque.jumuaIqama,
            }}
          />
        </CardContent>
      </Card>

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
