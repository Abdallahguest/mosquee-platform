import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getMosqueBySlug, getPublicAnnouncement } from "@/db/queries"
import { contentLanguageName, shouldShowContentLangNote } from "@/lib/content-language"
import PublicNav from "@/components/public/PublicNav"
import PublicFooter from "@/components/public/PublicFooter"
import MarkdownContent from "@/components/public/MarkdownContent"
import BackLink from "@/components/BackLink"
import AudioPlayer from "@/components/public/AudioPlayer"
import { getMosqueName } from "@/lib/mosque-name"

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, id } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Introuvable" }
  const announcement = await getPublicAnnouncement(Number(id), mosque.id)
  if (!announcement) return { title: "Introuvable" }
  return {
    title: `${announcement.title} — ${mosque.name}`,
    description: announcement.content.slice(0, 150),
  }
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug, id } = await params

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  // Sécurité : exige une annonce PUBLIÉE, non expirée, de CETTE mosquée.
  // Sinon notFound() — un brouillon ou une annonce d'une autre mosquée
  // n'est jamais accessible par URL devinée.
  const announcement = await getPublicAnnouncement(Number(id), mosque.id)
  if (!announcement) notFound()

  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const ta = await getTranslations("announcements")
  const tc = await getTranslations("common")
  const showLangNote = shouldShowContentLangNote(locale)

  const dateString = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString(locale, {
        day: "numeric", month: "long", year: "numeric",
      })
    : null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav mosqueName={displayName} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          <BackLink href={`/m/${slug}`} label={ta("backToMosque")} />

          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h1 className="text-xl font-bold text-gray-900 leading-snug mb-2">
              {announcement.title}
            </h1>
            {dateString && (
              <p className="text-xs text-gray-500 mb-3" dir="ltr">{dateString}</p>
            )}
            {showLangNote && (
              <p className="text-[11px] text-gray-400 mb-3">
                {tc("contentInLang", { lang: contentLanguageName(locale) })}
              </p>
            )}
            <div className="text-sm text-gray-700 leading-relaxed">
              <MarkdownContent content={announcement.content} />
            </div>
            {announcement.audioUrl && (
              <AudioPlayer
                url={announcement.audioUrl}
                listenLabel={ta("listenAudio")}
                openLabel={ta("openAudio")}
              />
            )}
          </article>

        </div>
      </main>

      <PublicFooter mosque={mosque} displayName={displayName} />
    </div>
  )
}
