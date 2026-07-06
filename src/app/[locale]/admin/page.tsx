import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { getSessionMosque } from "@/lib/auth-helpers"
import LogoutButton from "@/components/LogoutButton"
import NoMosque from "@/components/admin/NoMosque"
import { getAnnouncementsCount, getEventsCount, getLastPrayerTimesUpdate } from "@/db/queries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { computeSubscriptionStatus } from "@/lib/subscription-status"

function daysUntil(date: Date | null): number {
  if (!date) return 0
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 3600 * 24)))
}

function formatDate(date: Date | null, locale: string): string {
  if (!date) return "—"
  return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
}

export default async function AdminPage() {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.dashboard")
  const locale = await getLocale()

  const [announcementsCount, eventsCount, lastPrayerUpdate] = await Promise.all([
    getAnnouncementsCount(mosqueId),
    getEventsCount(mosqueId),
    getLastPrayerTimesUpdate(mosqueId),
  ])

  const publishedAnnouncements = announcementsCount.published
  const upcomingEvents         = eventsCount.upcoming
  const totalAnnouncements     = announcementsCount.total
  const totalEvents            = eventsCount.total

  const navItems = [
    {
      href:  "/admin/announcements",
      icon:  "📢",
      label: t("statAnnouncements"),
      desc:  t("announcementsDesc", { count: publishedAnnouncements }),
      total: totalAnnouncements,
    },
    {
      href:  "/admin/events",
      icon:  "📅",
      label: t("statEvents"),
      desc:  t("eventsDesc", { count: upcomingEvents }),
      total: totalEvents,
    },
    {
      href:  "/admin/settings",
      icon:  "⚙️",
      label: t("settingsDesc"),
      desc:  t("yourMosque"),
      total: null,
    },
  ]

  const isFirstTime = totalAnnouncements === 0 && totalEvents === 0

  // Rappel horaires : si jamais mis à jour OU pas de mise à jour depuis 30 jours
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const prayerTimesStale = !lastPrayerUpdate || lastPrayerUpdate < thirtyDaysAgo
  // Ne pas afficher le rappel si la mosquée vient d'être créée (< 3 jours)
  const mosqueAge = Date.now() - new Date(mosque.createdAt).getTime()
  const showPrayerReminder = prayerTimesStale && mosqueAge > 3 * 24 * 3600 * 1000

  const subscriptionStatus = computeSubscriptionStatus(mosque)
  const relevantDate = mosque.paidUntil ?? mosque.trialEndsAt
  const daysLeft = daysUntil(relevantDate)
  const expiryDateLabel = formatDate(relevantDate, locale)

  const connectedDate = new Date(session.session.createdAt).toLocaleString(locale, {
    day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("greeting")} <span aria-hidden="true">👋</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{session.user.name}</p>
          </div>
          <LogoutButton />
        </div>

        {/* Bloc info mosquée + badge jours restants (fonctionnalité 2) */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-green-800">
              <strong>{t("yourMosque")} :</strong> {mosque.name} — {mosque.city}
            </p>
            {/* Badge jours restants — visible uniquement en trial ou expiring_soon */}
            {(subscriptionStatus === "trial" || subscriptionStatus === "expiring_soon") && daysLeft > 0 && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                subscriptionStatus === "expiring_soon"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "bg-blue-100 text-blue-700 border border-blue-300"
              }`}>
                {subscriptionStatus === "expiring_soon"
                  ? t("expiringSoonBadge", { days: daysLeft })
                  : t("trialBadge", { days: daysLeft })}
              </span>
            )}
          </div>
        </div>

        {/* Bannière J-7 (fonctionnalité 1) — avertissement avant expiration */}
        {subscriptionStatus === "expiring_soon" && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-4">
            <p className="text-sm text-amber-800 font-medium mb-1">
              {t("expiringSoonBanner", { days: daysLeft })}
            </p>
            <p className="text-xs text-amber-700 mb-2">
              {t("trialBannerExpires", { date: expiryDateLabel })}
            </p>
            <a
              href="https://wa.me/224626736219"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              💬 {t("trialBannerContact")}
            </a>
          </div>
        )}

        {/* Bannière période gratuite (informative, pas alarmante) */}
        {subscriptionStatus === "trial" && daysLeft <= 14 && daysLeft > 7 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-blue-700">
              {t("trialBannerDays", { days: daysLeft })} · {t("trialBannerExpires", { date: expiryDateLabel })}
            </p>
          </div>
        )}

        <Link
          href={`/m/${mosque.slug}`}
          className="inline-flex items-center gap-1 text-xs text-green-700 hover:underline"
        >
          <span aria-hidden="true">🕌</span> {t("viewPublicPage")} <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Onboarding — affiché uniquement si aucune annonce ET aucun événement */}
      {isFirstTime && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-semibold text-amber-900 mb-1">{t("onboardingTitle")}</h2>
          <p className="text-sm text-amber-700 mb-4">{t("onboardingSubtitle")}</p>
          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: t("onboardingStep1Title"),
                desc:  t("onboardingStep1Desc"),
                href:  "/admin/settings",
                link:  t("onboardingStep1Link"),
              },
              {
                step: "2",
                title: t("onboardingStep2Title"),
                desc:  t("onboardingStep2Desc"),
                href:  "/admin/announcements",
                link:  t("onboardingStep2Link"),
              },
              {
                step: "3",
                title: t("onboardingStep3Title"),
                desc:  t("onboardingStep3Desc"),
                href:  `/m/${mosque.slug}`,
                link:  t("onboardingStep3Link"),
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-200 text-amber-900 text-sm font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">{item.title}</p>
                  <p className="text-xs text-amber-700 mt-0.5">{item.desc}</p>
                  <Link
                    href={item.href}
                    className="text-xs text-green-700 hover:underline font-medium mt-1 inline-block"
                  >
                    {item.link}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t("statAnnouncements"), value: totalAnnouncements, icon: "📢" },
          { label: t("statEvents"),        value: totalEvents,        icon: "📅" },
          { label: t("statMosque"),        value: mosque?.isVerified ? "✓" : "—", icon: "🕌" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2" aria-hidden="true">{stat.icon}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rappel horaires — si pas mis à jour depuis 30 jours (anti-gharar) */}
      {showPrayerReminder && !isFirstTime && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">🕌</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-0.5">
                {lastPrayerUpdate
                  ? "Les horaires n'ont pas été mis à jour depuis plus de 30 jours."
                  : "Les horaires de prière n'ont pas encore été saisis."}
              </p>
              <p className="text-xs text-blue-700 mb-2">
                Les fidèles consultent les horaires en premier. Une information à jour est essentielle.
              </p>
              <Link
                href="/admin/settings"
                className="text-xs font-medium text-blue-800 hover:underline"
              >
                Mettre à jour les horaires →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="space-y-3 mb-8">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                    <div>
                      <CardTitle className="text-base">{item.label}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.total !== null && (
                      <Badge variant="secondary">{t("totalCount", { count: item.total })}</Badge>
                    )}
                    <span className="text-muted-foreground rtl:rotate-180" aria-hidden="true">→</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Connexion */}
      <Alert>
        <AlertDescription>
          {t("connectedSince", { date: connectedDate })}
        </AlertDescription>
      </Alert>

    </div>
  )
}
