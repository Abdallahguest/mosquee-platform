// Page 404 racine — couvre toutes les routes hors segment [locale].
// Doit être autonome : pas de next-intl (pas de locale disponible ici),
// pas de layout [locale] (html/body non fournis par le layout racine).
// Styles inline pour être sûr que la page s'affiche correctement.
export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }} aria-hidden="true">🕌</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Page introuvable
            </h1>
            <p style={{ color: "#6b7280", marginBottom: 32 }}>
              Cette page n&apos;existe pas.
            </p>
            <a
              href="/"
              style={{
                background: "#15803d",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: 8,
                fontWeight: 600,
                textDecoration: "none",
                fontSize: 15,
              }}
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
