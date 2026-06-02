import { getTranslations } from "next-intl/server"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default async function NoMosque() {
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
