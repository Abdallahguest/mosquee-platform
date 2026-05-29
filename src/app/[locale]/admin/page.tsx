import Link from "next/link"
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
      label: "Annonces",
      desc:  `${publishedAnnouncements} publiée${publishedAnnouncements > 1 ? "s" : ""}`,
      total: allAnnouncements.length,
    },
    {
      href:  "/admin/events",
      icon:  "📅",
      label: "Événements",
      desc:  `${upcomingEvents} à venir`,
      total: allEvents.length,
    },
    {
      href:  "/admin/settings",
      icon:  "⚙️",
      label: "Paramètres",
      desc:  "Configuration mosquée",
      total: null,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assalamu alaykum 👋
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{session.user.name}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-700">
            <strong>Mosquée :</strong> {mosque.name} — {mosque.city}
          </p>
        </div>

        <Link
          href={`/m/${mosque.slug}`}
          className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
        >
          🕌 Voir la page publique →
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Annonces",   value: allAnnouncements.length, icon: "📢" },
          { label: "Événements", value: allEvents.length,        icon: "📅" },
          { label: "Mosquée",    value: mosque?.isVerified ? "✓" : "—", icon: "🕌" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
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
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.total !== null && (
                      <Badge variant="secondary">{item.total} total</Badge>
                    )}
                    <span className="text-muted-foreground">→</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Session */}
      <Alert>
        <AlertDescription>
          Session active depuis{" "}
          {new Date(session.session.createdAt).toLocaleString("fr-FR", {
            day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
          })}
        </AlertDescription>
      </Alert>

    </div>
  )
}
