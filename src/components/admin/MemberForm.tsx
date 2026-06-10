"use client"

import type { FormEvent } from "react"
import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { createMember, updateMember } from "@/lib/actions/member.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CATEGORIES = ["imam", "sage", "conseiller", "equipe"] as const

interface Member {
  id: number
  name: string
  category: string
  role: string | null
  sortOrder: number
}

interface MemberFormProps {
  editing: Member | null
  onSaved: () => void
  onCancelEdit: () => void
}

export default function MemberForm({ editing, onSaved, onCancelEdit }: MemberFormProps) {
  const t = useTranslations("admin.members")
  const tc = useTranslations("admin.common")
  const { fromResult } = useErrorMessages()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = editing
      ? await updateMember(editing.id, formData)
      : await createMember(formData)

    setLoading(false)
    if (!result.success) {
      setError(fromResult(result))
      return
    }
    formRef.current?.reset()
    onSaved()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="space-y-1.5">
        <Label htmlFor="name">{t("fieldName")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
        <Input id="name" name="name" aria-required="true" defaultValue={editing?.name ?? ""} key={`name-${editing?.id ?? "new"}`} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">{t("fieldCategory")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
        <select
          id="category"
          name="category"
          aria-required="true"
          defaultValue={editing?.category ?? "imam"}
          key={`cat-${editing?.id ?? "new"}`}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`category.${c}`)}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">{t("fieldRole")}</Label>
        <Input id="role" name="role" defaultValue={editing?.role ?? ""} placeholder={t("rolePlaceholder")} key={`role-${editing?.id ?? "new"}`} />
        <p className="text-xs text-muted-foreground">{t("roleHelp")}</p>
      </div>

      <input type="hidden" name="sortOrder" defaultValue={editing?.sortOrder ?? 0} />

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1 bg-green-700 hover:bg-green-800">
          {loading ? t("saving") : editing ? t("updateButton") : t("createButton")}
        </Button>
        {editing && (
          <Button type="button" variant="outline" onClick={() => { setError(""); onCancelEdit() }} disabled={loading}>
            {t("cancel")}
          </Button>
        )}
      </div>
    </form>
  )
}
