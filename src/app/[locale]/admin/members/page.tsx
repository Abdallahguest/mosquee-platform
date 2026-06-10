import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getMosqueMembers } from "@/db/queries"
import MembersManager from "@/components/admin/MembersManager"
import NoMosque from "@/components/admin/NoMosque"

export default async function MembersPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.members")
  const members = await getMosqueMembers(mosqueId)

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("pageTitle")}</h1>
        <p className="text-gray-500">{t("pageSubtitle")}</p>
        {/* Rappel privacy : liste non publique tant que les membres n'ont pas consenti. */}
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
          {t("privacyNote")}
        </p>
      </div>

      <MembersManager members={members} />
    </main>
  )
}
