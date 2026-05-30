interface AdminFooterProps {
  userName?: string
  userEmail?: string
}

export default function AdminFooter({ userName, userEmail }: AdminFooterProps) {
  return (
    <footer className="bg-green-950 text-green-100 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs">
          Connecté : {userName ? `${userName} · ` : ""}{userEmail}
        </p>
        <p className="text-[11px] text-green-300">
          Administration · Plateforme halal
        </p>
      </div>
    </footer>
  )
}
