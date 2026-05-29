# 🕌 Plateforme Mosquée

Application web de gestion pour mosquées — horaires de prière calculés
automatiquement, annonces et événements. Conçue selon les principes du
fiqh al-muamalat : sans riba, sans gharar, sans ghich, sans jahàla.

![Performance](https://img.shields.io/badge/Performance-94-success)
![Accessibility](https://img.shields.io/badge/Accessibility-100-success)
![SEO](https://img.shields.io/badge/SEO-100-success)

## ✨ Démo en ligne

[→ Voir la démo](https://votre-url.vercel.app)
[→ Page d'une mosquée](https://votre-url.vercel.app/m/masdjid-taqwa)

## 📋 Fonctionnalités

### Page publique
- Horaires de prière calculés astronomiquement (méthodes MWL, ISNA,
  Egyptian, Umm Al-Qura, Karachi)
- Compte à rebours en temps réel vers la prochaine prière
- Annonces de la mosquée
- Événements à venir
- Multilingue, responsive, installable (PWA)

### Panneau d'administration
- Authentification sécurisée (email + mot de passe)
- Gestion des annonces (créer, publier, supprimer)
- Gestion des événements
- Configuration de la mosquée (géolocalisation, méthode de calcul)

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| Base de données | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Authentification | Better-Auth |
| Horaires | adhan-js |
| Validation | Zod |
| Tests | Vitest (43 tests, 95%+ couverture) |
| Hébergement | Vercel |

## 🏗️ Architecture

- Server Components par défaut (performance, zéro JS inutile)
- Server Actions pour les mutations (pas d'API REST séparée)
- Validation Zod systématique côté serveur
- Headers de sécurité (CSP, X-Frame-Options, etc.)

## 🚀 Installation locale

\`\`\`bash
# Cloner le dépôt
git clone https://github.com/Abdallahguest/mosquee-platform.git
cd mosquee-platform

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Remplir DATABASE_URL, BETTER_AUTH_SECRET, etc.

# Pousser le schéma et insérer des données de test
pnpm db:push
pnpm db:seed

# Lancer en développement
pnpm dev
\`\`\`

## 🧪 Tests

\`\`\`bash
pnpm test           # mode watch
pnpm test:run       # une fois
pnpm test:coverage  # avec couverture
\`\`\`

## 📊 Qualité

- Lighthouse : Performance 94 · Accessibilité 100 · Best Practices 100 · SEO 100
- Conformité WCAG 2.1 AA
- TypeScript strict, ESLint, Prettier
- Tests unitaires sur toute la logique métier

## 📜 Éthique

Cette plateforme respecte les principes du commerce islamique :
- **Sans riba** : aucun frais d'intérêt, aucune dette
- **Sans gharar** : transparence totale (méthode de calcul affichée)
- **Sans ghich** : pas de dark patterns, pas de tracking publicitaire
- **Sans jahàla** : code open-source, données exportables, rien de caché

## 📄 Licence

[À définir : MIT, ou propriétaire selon votre choix]

---

Développé par Abdallah · Étudiant L3 Génie Logiciel
