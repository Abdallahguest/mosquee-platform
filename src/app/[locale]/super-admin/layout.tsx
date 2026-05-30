import { requireSuperAdmin } from "@/lib/auth-helpers"
import SuperAdminNav from "@/components/superadmin/SuperAdminNav"
import SuperAdminFooter from "@/components/superadmin/SuperAdminFooter"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireSuperAdmin()

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SuperAdminNav />
      <main className="flex-1">{children}</main>
      <SuperAdminFooter />
    </div>
  )
}
