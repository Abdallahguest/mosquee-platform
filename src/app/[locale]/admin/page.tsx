import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSessionMosque } from "@/lib/auth-helpers"
import LogoutButton from "@/components/LogoutButton"
import NoMosque from "@/components/admin/NoMosque"
import { getAllAnnouncements, getAllEvents } from "@/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function AdminPage() {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.dashboard")
  const locale = await getLocale()

  const [allAnnouncements, allEvents] = await Promise.all([
    getAllAnnouncements(mosqueId),
    getAllEvents(mosqueId),
  ])

  const publishedAnnouncements = allAnnouncements.filter(a => a.isPublished).length
  const upcomingEvents = allEvents.filter(
    e => e.isPublished && new Date(e.startAt) > new Date()
  ).length

  const navItems = [
    {
      href:  "/admin/announcements",
      icon:  "📢",
      label: t("statAnnouncements"),
      desc:  t("announcementsDesc", { count: publishedAnnouncements }),
      total: allAnnouncements.length,
    },
    {
      href:  "/admin/events",
      icon:  "📅",
      label: t("statEvents"),
      desc:  t("eventsDesc", { count: upcomingEvents }),
      total: allEvents.length,
    },
    {
      href:  "/admin/settings",
      icon:  "⚙️",
      label: t("settingsDesc"),
      desc:  t("yourMosque"),
      total: null,
    },
  ]

  const connectedDate = new Date(session.session.createdAt).toLocaleString(locale, {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("greeting")} <span aria-hidden="true">👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{session.user.name}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Bloc info mosquée — vert (cohérent avec l'interface), corrige P2 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-800">
            <strong>{t("yourMosque")} :</strong> {mosque.name} — {mosque.city}
          </p>
        </div>

        <Link
          href={`/m/${mosque.slug}`}
          className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
        >
          <span aria-hidden="true">🕌</span> {t("viewPublicPage")} <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t("statAnnouncements"), value: allAnnouncements.length, icon: "📢" },
          { label: t("statEvents"),        value: allEvents.length,        icon: "📅" },
          { label: t("statMosque"),        value: mosque?.isVerified ? "✓" : "—", icon: "🕌" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2" aria-hidden="true">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="space-y-3 mb-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <div>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.total !== null && (
                      <Badge variant="secondary">{t("totalCount", { count: item.total })}</Badge>
                    )}
                    <span className="text-muted-foreground rtl:rotate-180" aria-hidden="true">→</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Connexion */}
      <Alert>
        <AlertDescription>
          {t("connectedSince", { date: connectedDate })}
        </AlertDescription>
      </Alert>

    </div>
  )
}
