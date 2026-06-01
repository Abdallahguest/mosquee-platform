import type { Metadata, Viewport } from "next"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Geist, Noto_Sans_Arabic } from "next/font/google"
import "../globals.css"

// Police latine (FR/EN)
const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-latin" })
// Police arabe dédiée (AR) — Geist ne couvre pas l'arabe (corrige P1)
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-arabic",
})

export const metadata: Metadata = {
  title: "Plateforme Mosquée",
  description: "Horaires de prière, annonces et événements",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mosquée",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  // maximumScale retiré : ne jamais bloquer le zoom (accessibilité, corrige A5)
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const dir = locale === "ar" ? "rtl" : "ltr"
  // La police active dépend de la langue : arabe pour AR, Geist sinon.
  const fontClass = locale === "ar" ? notoArabic.className : geist.className

  return (
    <html lang={locale} dir={dir} className="h-full">
      <body className={`${geist.variable} ${notoArabic.variable} ${fontClass} h-full bg-gray-50 antialiased`}>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
