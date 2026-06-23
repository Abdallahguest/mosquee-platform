# 🕌 Amana Connect

Plateforme SaaS multi-tenant de gestion pour mosquées — horaires de prière,
annonces et événements, consultable hors connexion. Déployée en production et
validée sur le terrain auprès d'une mosquée réelle. Conçue selon les principes
du fiqh al-muamalat : sans riba, sans gharar, sans ghich, sans jahàla.

![Performance](https://img.shields.io/badge/Performance-94-success)
![Accessibility](https://img.shields.io/badge/Accessibility-100-success)
![Best Practices](https://img.shields.io/badge/Best%20Practices-100-success)
![SEO](https://img.shields.io/badge/SEO-100-success)

## ✨ Démo en ligne

[→ Voir la démo](https://mosquee-platform.vercel.app) · [amanaconnect.org](https://amanaconnect.org)
[→ Page d'une mosquée](https://mosquee-platform.vercel.app/m/masdjid-taqwa)

## 📋 Fonctionnalités

### Page publique

- Horaires de prière en **saisie manuelle** : la mosquée affiche ses horaires
  réels (un calcul astronomique MWL sert uniquement de suggestion à
  l'administrateur, jamais de source affichée — voir section Éthique)
- Compte à rebours en temps réel vers la prochaine prière
- Annonces de la mosquée (avec archive et pages de détail)
- Événements à venir et passés
- **Trilingue FR / EN / AR** avec support complet de l'arabe (RTL)
- Responsive (pensée mobile d'abord) et installable (PWA), **consultable hors connexion**

### Panneau d'administration

- Authentification sécurisée (email + mot de passe)
- Gestion des annonces (créer, publier, épingler, supprimer)
- Gestion des événements
- Gestion des membres (imams, conseillers, équipe)
- Configuration de la mosquée (identité, localisation, horaires, contact)

### Super-administration

- Gestion des mosquées (création, vérification)
- Gestion complète des comptes (CRUD avec garde-fous)
- Isolation stricte des données entre mosquées (multi-tenant)

## 🛠️ Stack technique

| Couche | Technologie |

|---|---|
| Framework | Next.js 16 (App Router) |
| Langage | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| Base de données | PostgreSQL (Neon) |
| ORM | Drizzle ORM |
| Authentification | Better-Auth |
| Internationalisation | next-intl (FR / EN / AR) |
| Hors-ligne (PWA) | Serwist (service worker) |
| Validation | Zod |
| E-mail | Resend |
| Tests | Vitest (113 tests) |
| Hébergement | Vercel |

## 🏗️ Architecture

- **Multi-tenant** : chaque requête est liée à une mosquée ; l'accès aux données
  est contrôlé à ce niveau pour garantir l'isolation entre organisations
- Server Components par défaut (performance, zéro JS inutile)
- Server Actions pour les mutations (pas d'API REST séparée)
- Module d'autorisation centralisé, couvert par des tests prouvant l'absence
  de fuite de données entre mosquées
- Validation Zod systématique côté serveur
- Stratégie hors-ligne « réseau d'abord » : le contenu frais est toujours
  privilégié quand le réseau est disponible ; le cache ne sert que de secours
- Headers de sécurité (CSP, X-Frame-Options, etc.)

## 🚀 Installation locale

```bash
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
```

## 🧪 Tests

```bash
pnpm test           # mode watch
pnpm test:run       # une fois
pnpm test:coverage  # avec couverture
```

## 📊 Qualité

- Lighthouse : Performance 94 · Accessibilité 100 · Best Practices 100 · SEO 100
- Conformité WCAG 2.1 AA
- TypeScript strict, ESLint, Prettier
- 113 tests automatisés (logique métier + intégration des actions serveur)
- **Validation terrain** : testé et approuvé par le responsable de la mosquée
  Masdjid TAQWA (Conakry) dans le cadre d'une expérimentation réelle

## 📜 Éthique

Cette plateforme respecte les principes du commerce islamique :

- **Sans riba** : aucun frais d'intérêt, aucune dette
- **Sans gharar** : pas d'incertitude trompeuse — les horaires affichés sont
  ceux réellement appliqués par la mosquée, jamais des valeurs calculées
  présentées comme certaines
- **Sans ghich** : pas de dark patterns, pas de tracking publicitaire
- **Sans jahàla** : données exportables, politique de confidentialité claire,
  rien de caché

## 📄 Licence

Propriétaire

---

Développé par Abdallah · Étudiant L3 Génie Logiciel
