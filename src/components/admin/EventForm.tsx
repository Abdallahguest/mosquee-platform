"use client"

import { useState, useRef } from "react"
import type { FormEvent } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { createEvent, updateEvent } from "@/lib/actions/event.actions"
import { useRouter } from "@/i18n/navigation"
import { useDraftPersistence } from "@/lib/use-draft-persistence"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EventFormProps {
  event?: {
    id: number
    title: string
    description: string | null
    location: string
    startAt: Date
    endAt: Date | null
    isPublished: boolean
    audioUrl: string | null
  }
}

// Format une Date pour un <input type="datetime-local"> (heure locale, sans secondes)
function toLocalInput(date: Date | null | undefined): string | undefined {
  if (!date) return undefined
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventForm({ event }: EventFormProps) {
  const t = useTranslations("admin.eventForm")
  const tc = useTranslations("admin.common")
  const td = useTranslations("admin.draft")
  const { fromResult } = useErrorMessages()
  const isEdit = event != null
  const router = useRouter()
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  // ── Écriture résiliente : sauvegarde locale du brouillon (Niveau A) ──
  const { hasDraft, draftSavedAt, restoreDraft, clearDraft, dismissDraft } =
    useDraftPersistence({
      formKey: isEdit ? `event:edit:${event.id}` : "event:new",
      formRef,
    })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await updateEvent(event.id, formData)
      : await createEvent(formData)

    if (!result.success) {
      // Envoi échoué : on GARDE le brouillon pour réessai.
      setError(fromResult(result))
      setLoading(false)
      return
    }

    // Envoi réussi : le brouillon n'est plus nécessaire.
    clearDraft()

    if (isEdit) {
      router.push("/admin/events")
      router.refresh()
      return
    }

    setSuccess(t("createdSuccess"))
    formRef.current?.reset()
    setLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isEdit ? t("editTitle") : t("newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Proposition de restauration d'un brouillon non publié */}
          {hasDraft && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  {td("found")}
                  {draftSavedAt && (
                    <span className="text-xs opacity-80">
                      {" "}({new Date(draftSavedAt).toLocaleString()})
                    </span>
                  )}
                </span>
                <span className="flex gap-2">
                  <button type="button" onClick={restoreDraft} className="text-sm font-medium underline">
                    {td("restore")}
                  </button>
                  <button type="button" onClick={dismissDraft} className="text-sm opacity-70">
                    {td("ignore")}
                  </button>
                </span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">{t("fieldTitle")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
            <Input id="title" name="title" aria-required="true" maxLength={100} placeholder={t("titlePlaceholder")} defaultValue={event?.title} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t("fieldDescription")}</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              maxLength={1000}
              className="resize-none"
              placeholder={t("descriptionPlaceholder")}
              defaultValue={event?.description ?? undefined}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">{t("fieldLocation")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
            <Input
              id="location"
              name="location"
              aria-required="true"
              defaultValue={event?.location ?? t("defaultLocation")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startAt">{t("fieldStart")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input id="startAt" name="startAt" type="datetime-local" aria-required="true" defaultValue={toLocalInput(event?.startAt)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endAt">{t("fieldEnd")}</Label>
              <Input id="endAt" name="endAt" type="datetime-local" defaultValue={toLocalInput(event?.endAt)} />
            </div>
          </div>

          {/* Lien audio externe (facultatif). Aucun fichier stocké. */}
          <div className="space-y-1.5">
            <Label htmlFor="audioUrl">{t("fieldAudioUrl")}</Label>
            <Input
              id="audioUrl"
              name="audioUrl"
              type="url"
              dir="ltr"
              placeholder="https://..."
              defaultValue={event?.audioUrl ?? ""}
            />
            <p className="text-xs text-muted-foreground">{t("audioUrlHelp")}</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              id="eventPublished"
              value="true"
              defaultChecked={event?.isPublished}
              className="w-4 h-4 accent-green-600"
            />
            <Label htmlFor="eventPublished" className="font-normal cursor-pointer">
              {t("publishNow")}
            </Label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading
              ? t("saving")
              : isEdit
                ? t("saveButton")
                : t("createButton")}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}
