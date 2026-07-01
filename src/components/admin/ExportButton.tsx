"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { exportMosqueData } from "@/lib/actions/export.actions"
import { Button } from "@/components/ui/button"
import { showToast } from "@/components/ui/toast-provider"

export default function ExportButton({ mosqueId, mosqueSlug }: { mosqueId: number; mosqueSlug: string }) {
  const t = useTranslations("admin.export")
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const result = await exportMosqueData(mosqueId)
    setLoading(false)

    if (!result.success) {
      showToast(result.error ?? "Erreur lors de l'export", "error")
      return
    }

    const blob = new Blob([result.data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${mosqueSlug}-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <span aria-hidden="true">📥</span> {loading ? t("loading") : t("button")}
    </Button>
  )
}
