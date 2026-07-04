"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { renewSubscription } from "@/lib/actions/subscription.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RenewButton({ mosqueId, mosqueName }: { mosqueId: number; mosqueName: string }) {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("mosqueId", String(mosqueId))
    const result = await renewSubscription(formData)
    setLoading(false)
    if (!result.success) {
      showToast(result.error, "error")
      return
    }
    showToast(`Paiement enregistré pour ${mosqueName}.`, "success")
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto">
        💰 Enregistrer un paiement
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3 w-full sm:w-72">
      <p className="text-sm font-semibold text-green-900">{mosqueName}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor={`months-${mosqueId}`} className="text-xs">Mois</Label>
          <Input
            id={`months-${mosqueId}`}
            name="months"
            type="number"
            min="1"
            max="12"
            defaultValue="1"
            required
            className="h-8 text-sm"
            dir="ltr"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`amount-${mosqueId}`} className="text-xs">Montant (GNF)</Label>
          <Input
            id={`amount-${mosqueId}`}
            name="amountGNF"
            type="number"
            min="0"
            defaultValue="40000"
            required
            className="h-8 text-sm"
            dir="ltr"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Mode de paiement</Label>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="radio" name="paymentMethod" value="cash" defaultChecked />
            Espèces
          </label>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="radio" name="paymentMethod" value="orange_money" />
            Orange Money
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`note-${mosqueId}`} className="text-xs">Note (facultatif)</Label>
        <Input
          id={`note-${mosqueId}`}
          name="note"
          placeholder="Remarque…"
          className="h-8 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} className="flex-1 bg-green-700 hover:bg-green-800">
          {loading ? "..." : "Confirmer"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  )
}
