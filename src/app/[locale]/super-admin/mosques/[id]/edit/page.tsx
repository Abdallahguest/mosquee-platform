import { notFound } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getMosqueById } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import MosqueAdminForm from "@/components/superadmin/MosqueAdminForm"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditMosquePage({ params }: PageProps) {
  await requireSuperAdmin()
  const { id } = await params
  const mosque = await getMosqueById(Number(id))
  if (!mosque) notFound()

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/super-admin" className="text-sm text-gray-400 hover:text-gray-600">
        ← Retour
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Modifier {mosque.name}</h1>
      <MosqueAdminForm mosque={mosque} />
    </div>
  )
}
