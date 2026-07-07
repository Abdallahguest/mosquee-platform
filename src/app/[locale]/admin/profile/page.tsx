import { getTranslations } from "next-intl/server"
import { requireSession } from "@/lib/auth-helpers"
import ProfileForm from "@/components/admin/ProfileForm"

export default async function ProfilePage() {
  const session = await requireSession()
  const t = await getTranslations("admin.profile")

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t("title")}</h1>
        <p className="text-gray-500 text-sm">{t("subtitle")}</p>
      </div>

      <ProfileForm
        currentName={session.user.name}
        currentEmail={session.user.email}
      />
    </main>
  )
}
