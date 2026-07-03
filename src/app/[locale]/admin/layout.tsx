import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"
import { auth } from "@/lib/auth"
import { getPrimaryMosqueByUserId, getMosqueById } from "@/db/queries"
import { getMosqueName } from "@/lib/mosque-name"
import AdminNav from "@/components/admin/AdminNav"
import AdminFooter from "@/components/admin/AdminFooter"
import { SELECTED_MOSQUE_COOKIE } from "@/lib/mosque-cookie"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const user = session.user as { id: string; role?: string }
  const isSuperAdmin = user.role === "super_admin"

  // Pour le super-admin : utiliser le cookie de sélection de mosquée
  // pour afficher le bon nom dans la navbar.
  let mosque = null
  if (isSuperAdmin) {
    const cookieStore = await cookies()
    const selectedId = cookieStore.get(SELECTED_MOSQUE_COOKIE)?.value
    if (selectedId) {
      mosque = await getMosqueById(Number(selectedId))
    }
  } else {
    mosque = await getPrimaryMosqueByUserId(session.user.id)
  }

  const locale = await getLocale()
  const mosqueName = mosque ? getMosqueName(mosque, locale) : undefined

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminNav mosqueName={mosqueName} mosqueSlug={mosque?.slug} isSuperAdmin={isSuperAdmin} />
      <main className="flex-1">{children}</main>
      <AdminFooter userName={session.user.name} userEmail={session.user.email} />
    </div>
  )
}
