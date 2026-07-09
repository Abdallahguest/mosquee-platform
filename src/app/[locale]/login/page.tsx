"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { logSignIn } from "@/lib/actions/auth-log.actions"
import { getClientIp } from "@/lib/actions/get-ip.actions"

export default function LoginPage() {
  const t = useTranslations("auth")

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message || t("genericError"))
        getClientIp().then(ip => logSignIn(email, false, ip ?? undefined).catch(() => {}))
      } else {
        getClientIp().then(ip => logSignIn(email, true, ip ?? undefined).catch(() => {}))
        window.location.href = "/admin"
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"))
      getClientIp().then(ip => logSignIn(email, false, ip ?? undefined).catch(() => {}))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">🕌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("loginTitle")}</h1>
          <p className="text-gray-500">{t("loginSubtitle")}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("fieldEmail")}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder={t("emailPlaceholder")}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("fieldPassword")}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>

            <div className="text-end">
              <Link href="/forgot-password" className="text-xs text-green-700 hover:underline">
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-xl font-medium hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t("loginLoading") : t("loginButton")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {t("noAccount")}{" "}
              <Link href="/register" className="text-green-700 hover:underline font-medium">
                {t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </main>
  )
}
