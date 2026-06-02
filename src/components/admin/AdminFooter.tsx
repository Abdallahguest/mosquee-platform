import { getTranslations } from "next-intl/server"

interface AdminFooterProps {
  userName?: string
  userEmail?: string
}

export default async function AdminFooter({ userName, userEmail }: AdminFooterProps) {
  const t = await getTranslations("admin.footer")
  const identity = userName || userEmail || ""

  return (
    <footer className="bg-green-950 text-green-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        {identity && (
          <p className="text-xs" dir="ltr">
            {t("connectedAs", { name: identity })}
          </p>
        )}
        <p className="text-[11px] text-green-300">
          {t("admin")}
        </p>
      </div>
    </footer>
  )
}
