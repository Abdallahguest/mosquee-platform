import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function NoMosque() {
  // Si super-admin → rediriger vers le sélecteur de mosquée
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user as { role?: string } | undefined
  if (user?.role === "super_admin") {
    redirect("/admin/select-mosque")
  }

  const t = await getTranslations("admin.noMosque")
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Alert>
        <AlertDescription>
          <p className="font-medium mb-1">{t("title")}</p>
          <p className="text-sm">{t("body")}</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
