import { getSuperAdminStats } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function SuperAdminDashboard() {
  const stats = await getSuperAdminStats()

  const cards = [
    { label: "Mosquées", value: stats.mosques, sub: `${stats.mosquesVerified} vérifiée(s)`, icon: "🕌" },
    { label: "Comptes", value: stats.users, sub: `${stats.usersVerified} vérifié(s)`, icon: "👥" },
    { label: "Annonces", value: stats.announcements, sub: "au total", icon: "📢" },
    { label: "Événements", value: stats.events, sub: "au total", icon: "📅" },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* En-tête : empilé sur mobile, en ligne sur écran large */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de la plateforme</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/super-admin/mosques" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Gérer les mosquées</Button>
          </Link>
          <Link href="/super-admin/users" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">Gérer les comptes</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <p className="text-sm font-medium text-gray-700 mt-1">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/super-admin/mosques">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <span className="text-2xl">🕌</span>
              <div>
                <p className="font-semibold text-gray-900">Mosquées</p>
                <p className="text-sm text-gray-500">Créer, modifier, supprimer</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/super-admin/users">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <span className="text-2xl">👥</span>
              <div>
                <p className="font-semibold text-gray-900">Comptes</p>
                <p className="text-sm text-gray-500">Créer et gérer les admins</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
