# Sécurité — Amana Connect

## Signaler une vulnérabilité

Si vous découvrez une faille de sécurité, n'ouvrez pas d'issue publique.
Contactez directement : **abdallahmarly90@gmail.com**

Délai de réponse visé : 48 heures.

---

## Décisions de sécurité documentées

### Authentification

**Better-Auth** avec adaptateur Drizzle (PostgreSQL Neon).

- Email + mot de passe uniquement (`disableSignUp: true` — inscription publique fermée)
- Comptes créés uniquement par le super-admin (Modèle B)
- Mot de passe minimum : 8 caractères
- Vérification email obligatoire avant accès
- Sessions 7 jours, cookie cache 5 min
- Reset de mot de passe par email (token valable 1 heure)

**Rate limiting en base (Better-Auth) :**

| Endpoint | Fenêtre | Limite |
|---|---|---|
| `/sign-in/email` | 60 s | 5 tentatives |
| `/sign-up/email` | 60 s | 5 tentatives |
| `/request-password-reset` | 60 s | 3 tentatives |
| `/reset-password` | 60 s | 5 tentatives |
| Général | 60 s | 100 requêtes |

---

### Autorisation multi-tenant

Module `src/lib/authorization.ts` — logique pure sans dépendance DB.

**Règles :**
- Un admin ne peut accéder qu'aux données de SA mosquée
- Toutes les mutations vérifient `mosqueId` côté serveur (jamais côté client)
- Un super-admin ne peut pas agir sur un autre super-admin (protection peer-to-peer)
- Couvert par des tests unitaires (`src/test/authorization.test.ts`)

---

### Middleware

`src/proxy.ts` — vérifie la **présence** du cookie de session sur les routes `/admin` et `/super-admin`.

**Limitation connue (D-008) :** le middleware Edge Runtime ne peut pas valider la session en base (contrainte Neon/TCP sur Vercel Edge). La validation complète est assurée par `requireSession()` dans chaque layout/page protégée (côté Node.js).

---

### Headers HTTP

Configurés dans `next.config.ts` pour toutes les routes :

```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**CSP actuelle :**
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
```

**Dette connue :** `unsafe-inline` et `unsafe-eval` sont nécessaires sans nonce.
À durcir via middleware nonce si le projet évolue vers des exigences PCI/RGPD strictes.

---

### Validation des entrées

- **Zod** systématique côté serveur sur toutes les Server Actions
- Codes d'erreur normalisés (`TITLE_REQUIRED`, `ORANGE_MONEY_INVALID`, etc.)
- **DOMPurify** (isomorphic) pour sanitiser le contenu Markdown avant rendu
- Numéros Orange Money : regex `^6\d{8}$` (format guinéen strict)

---

### Données sensibles

- Aucun fichier uploadé — liens externes uniquement (audio, don)
- Aucune photo de personne stockée (principe éthique non négociable)
- Pas de carte bancaire, pas de paiement en ligne
- Données exportables en JSON par l'admin (anti-jahàla)

---

### Audit log

Table `audit_log` en base — enregistre toutes les mutations significatives
(création/modification/suppression d'annonces, événements, membres, paramètres,
actions super-admin). Lecture seule côté applicatif.

---

### Dépendances

- Versions épinglées dans `package.json` (pas de `^` non contrôlé)
- `pnpm audit` à lancer avant chaque déploiement majeur

---

## Ce qui n'est PAS couvert (hors périmètre actuel)

- Tests de pénétration
- Revue OWASP ASVS complète
- Authentification multi-facteurs (MFA)
- Chiffrement des données au repos (géré par Neon)
- Rotation automatique des secrets

Ces points seront adressés si le projet atteint un niveau d'exposition plus large
(dizaines de mosquées, données sensibles additionnelles).
