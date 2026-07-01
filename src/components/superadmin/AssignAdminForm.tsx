"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { assignAdminToMosque } from "@/lib/actions/superadmin.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"

interface Candidate {
  id: string
  name: string
  email: string
  role: string
}

export default function AssignAdminForm({ mosqueId, candidates }: { mosqueId: number; candidates: Candidate[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleAssign() {
    if (!selected) return
    setLoading(true)
    const result = await assignAdminToMosque(mosqueId, selected)
    setLoading(false)
    if (!result.success) {
      showToast(result.error, "error")
      return
    }
    showToast("Admin assigné avec succès.", "success")
    setSelected("")
    router.refresh()
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full sm:flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">— Choisir un compte —</option>
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.email})
          </option>
        ))}
      </select>
      <Button
        onClick={handleAssign}
        disabled={loading || !selected}
        className="w-full sm:w-auto bg-green-700 hover:bg-green-800"
      >
        {loading ? "..." : "Assigner"}
      </Button>
    </div>
  )
}
