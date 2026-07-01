"use client"

// Toast global léger — pas de dépendance externe.
// Utilise un custom event "amana:toast" pour déclencher depuis n'importe où.
// Usage : window.dispatchEvent(new CustomEvent("amana:toast", { detail: { message, type } }))

import { useEffect, useState } from "react"

interface ToastItem {
  id: number
  message: string
  type: "success" | "error" | "info"
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    function handler(e: Event) {
      const { message, type = "success" } = (e as CustomEvent).detail
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3500)
    }
    window.addEventListener("amana:toast", handler)
    return () => window.removeEventListener("amana:toast", handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 end-4 z-50 flex flex-col gap-2 max-w-sm"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            t.type === "success"
              ? "bg-green-700 text-white"
              : t.type === "error"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-white"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// Utilitaire côté client pour déclencher un toast facilement
export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent("amana:toast", { detail: { message, type } }))
}
