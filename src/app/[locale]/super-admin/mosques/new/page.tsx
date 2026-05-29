import { requireSuperAdmin } from "@/lib/auth-helpers"
import { Link } from "@/i18n/navigation"
import MosqueAdminForm from "@/components/superadmin/MosqueAdminForm"

export default async function NewMosquePage() {
  await requireSuperAdmin()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/super-admin" className="text-sm text-gray-400 hover:text-gray-600">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Nouvelle mosquée</h1>
      <MosqueAdminForm />
    </div>
  )
}
