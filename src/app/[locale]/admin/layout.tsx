import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { auth } from "@/lib/auth"
import { getPrimaryMosqueByUserId } from "@/db/queries"
import { getMosqueName } from "@/lib/mosque-name"
import AdminNav from "@/components/admin/AdminNav"
import AdminFooter from "@/components/admin/AdminFooter"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  // Récupérer la mosquée pour afficher son nom dans la navbar
  const mosque = await getPrimaryMosqueByUserId(session.user.id)
  const locale = await getLocale()
  // Nom localisé selon la langue de l'admin (cohérent avec le public).
  const mosqueName = mosque ? getMosqueName(mosque, locale) : undefined

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNav mosqueName={mosqueName} mosqueSlug={mosque?.slug} />
      <main className="flex-1">{children}</main>
      <AdminFooter userName={session.user.name} userEmail={session.user.email} />
    </div>
  )
}
