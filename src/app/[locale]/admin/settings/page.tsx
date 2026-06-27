import { getTranslations, getLocale } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import MosqueSettingsForm from "@/components/admin/MosqueSettingsForm"
import PrayerTimesForm from "@/components/admin/PrayerTimesForm"
import ExportButton from "@/components/admin/ExportButton"
import NoMosque from "@/components/admin/NoMosque"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function AdminSettingsPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const locale = await getLocale()
  const guideHref = `/guides/guide-admin-${locale}.pdf`

  const t = await getTranslations("admin.settings")

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
      </div>

      {/* Horaires de prière — en haut, le plus visible */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t("prayerCardTitle")}</CardTitle>
          <CardDescription>{t("prayerCardDesc")}</CardDescription>
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
          <CardTitle className="text-base">{t("dataCardTitle")}</CardTitle>
          <CardDescription>{t("dataCardDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExportButton mosqueId={mosque.id} mosqueSlug={mosque.slug} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Guide d&apos;utilisation</CardTitle>
          <CardDescription>Le mode d&apos;emploi complet de votre espace administrateur, à consulter ou télécharger.</CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={guideHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 underline"
          >
            <span aria-hidden="true">📄</span> Ouvrir le guide (PDF)
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
