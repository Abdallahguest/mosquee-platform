import { getTranslations } from "next-intl/server"
import { getSuperAdminStats } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function SuperAdminDashboard() {
  const stats = await getSuperAdminStats()
  const t = await getTranslations("superAdmin.dashboard")

  const cards = [
    {
      label: t("statMosques"),
      value: stats.mosques,
      sub:   `${stats.mosquesVerified} ${t("verified")}`,
      icon:  "🕌",
    },
    {
      label: t("statUsers"),
      value: stats.users,
      sub:   `${stats.usersVerified} ${t("verifiedUsers")}`,
      icon:  "👥",
    },
    {
      label: t("statAnnouncements"),
      value: stats.announcements,
      sub:   t("total"),
      icon:  "📢",
    },
    {
      label: t("statEvents"),
      value: stats.events,
      sub:   t("total"),
      icon:  "📅",
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/super-admin/mosques" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              {t("manageMosques")}
            </Button>
          </Link>
          <Link href="/super-admin/users" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              {t("manageUsers")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2" aria-hidden="true">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <p className="text-sm font-medium text-gray-700 mt-1">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation rapide */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/super-admin/mosques">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <span className="text-2xl" aria-hidden="true">🕌</span>
              <div>
                <p className="font-semibold text-gray-900">{t("mosquesCard")}</p>
                <p className="text-sm text-gray-500">{t("mosquesDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/super-admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <span className="text-2xl" aria-hidden="true">👥</span>
              <div>
                <p className="font-semibold text-gray-900">{t("usersCard")}</p>
                <p className="text-sm text-gray-500">{t("usersDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
