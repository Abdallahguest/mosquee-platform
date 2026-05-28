"use client"

import { useState } from "react"
import { exportMosqueData } from "@/lib/actions/export.actions"
import { Button } from "@/components/ui/button"

export default function ExportButton({ mosqueId, mosqueSlug }: { mosqueId: number; mosqueSlug: string }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    const result = await exportMosqueData(mosqueId)
    setLoading(false)

    if (!result.success) {
      alert(result.error)
      return
    }

    // Créer un fichier téléchargeable
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
      {loading ? "Export..." : "📥 Exporter mes données"}
    </Button>
  )
}
