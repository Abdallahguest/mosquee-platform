import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"
import { getAllAnnouncements, getAllEvents, getAllMosques } from "@/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  // Récupérer toutes les mosquées
  const allMosques = await getAllMosques()
  
  if (allMosques.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Alert>
          <AlertDescription>
            <p className="font-medium mb-1">Aucune mosquée trouvée</p>
            <p className="text-sm">Exécutez le seed pour créer des données de test</p>
            <code className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">pnpm db:seed</code>
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  // Pour l'instant, utiliser la première mosquée
  // TODO: Permettre à l'utilisateur de sélectionner sa mosquée
  const mosque = allMosques[0]
  const mosqueId = mosque.id

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

        {/* Sélecteur de mosquée */}
        {allMosques.length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Mosquée active :</strong> {mosque.name}
            </p>
            <details className="text-xs text-blue-600">
              <summary className="cursor-pointer hover:underline">
                Voir toutes les mosquées ({allMosques.length})
              </summary>
              <ul className="mt-2 space-y-1 ml-4">
                {allMosques.map((m) => (
                  <li key={m.id}>
                    • {m.name} - {m.city} {m.id === mosque.id && "(active)"}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}

        {mosque && (
          <Link
            href={`/m/${mosque.slug}`}
            className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
          >
            🕌 Voir la page publique →
          </Link>
        )}
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
