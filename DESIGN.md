# Design System — Amana Connect

Documentation des choix visuels existants. Pas de bibliothèque externe dédiée —
les conventions sont appliquées via Tailwind CSS et les composants shadcn/ui.

---

## Couleurs

| Rôle | Valeur Tailwind | Hex | Usage |
|---|---|---|---|
| Primaire (mosquée/public) | `green-700` | `#15803d` | Boutons principaux, nav admin, accents |
| Primaire hover | `green-800` | `#166534` | Hover boutons verts |
| Super-admin | `#26215C` (custom) | — | Nav super-admin uniquement |
| Super-admin accent | `#534AB7` | — | Lien actif super-admin |
| Fond global | `gray-50` | `#f9fafb` | Arrière-plan pages |
| Fond cartes | `white` | `#ffffff` | Cartes, formulaires |
| Orange Money | `orange-500` | `#f97316` | Bouton USSD Orange Money uniquement |
| Onboarding | `amber-50` / `amber-200` | — | Bloc onboarding nouveaux comptes |
| Erreur | `red-*` (destructive shadcn) | — | Messages d'erreur |
| Succès | `green-50` / `green-200` | — | Messages de succès |

**Règle :** le vert (`green-*`) est la couleur de la mosquée et de l'espace admin.
L'indigo (`#26215C`) est réservé au super-admin. Ne pas les mélanger.

---

## Typographie

| Contexte | Police | Variable CSS | Fallback |
|---|---|---|---|
| FR / EN | Geist (Google Fonts) | `--font-latin` | `system-ui` |
| AR | Noto Sans Arabic (Google Fonts) | `--font-arabic` | `system-ui` |

La police active est sélectionnée via `fontClass` dans `[locale]/layout.tsx`
selon la locale. Ne jamais forcer une police dans un composant individuel.

---

## Espacement et mise en page

- **Conteneur max** : `max-w-lg` (page publique) / `max-w-2xl` (dashboard admin) / `max-w-4xl` (listes admin)
- **Padding page** : `px-6 py-8` (admin) / `px-6 py-6` (public)
- **Cartes** : `bg-white border border-gray-200 rounded-2xl` + `shadow-sm` optionnel
- **Séparateurs** : composant `<Separator />` de shadcn/ui

---

## Composants clés

### Boutons
```
Primaire admin  : bg-green-700 hover:bg-green-800 text-white
Secondaire      : variant="outline" (shadcn)
Destructif      : variant="destructive" (shadcn)
Désactivé       : disabled:opacity-50 disabled:cursor-not-allowed
Loading         : spinner SVG inline animate-spin (voir PageSkeleton.tsx)
```

### Formulaires
- Labels : `<Label>` shadcn, texte `text-sm font-medium`
- Inputs : `<Input>` shadcn, `dir="ltr"` pour les URLs/emails/téléphones
- Aide contextuelle : `<p className="text-xs text-muted-foreground">` sous le champ
- Champs obligatoires : `<span className="text-destructive">*</span>` + `aria-label`

### Messages feedback
- Erreur : `<Alert variant="destructive"><AlertDescription>`
- Succès : `<Alert className="border-green-200 bg-green-50 text-green-800">`
- Info : `<Alert><AlertDescription>` (neutre)
- Onboarding : `bg-amber-50 border border-amber-200 rounded-2xl`

### États vides
Icône emoji 5xl + titre `text-base font-medium text-gray-700` + description `text-sm text-muted-foreground`.
Centré verticalement avec `py-16 text-center`.

### Skeleton loading
Composant `PageSkeleton` (deux colonnes) et `PageSkeletonSingle` (colonne unique)
dans `src/components/admin/PageSkeleton.tsx`. Utilisé via `loading.tsx` dans
chaque route admin.

---

## Navigation

| Espace | Couleur fond | Composant |
|---|---|---|
| Public | — (pas de nav globale) | `PublicNav.tsx` par mosquée |
| Admin | `bg-green-800` | `AdminNav.tsx` |
| Super-admin | `#26215C` | `SuperAdminNav.tsx` |

---

## Accessibilité

- Zoom non bloqué (`maximumScale` retiré intentionnellement)
- `aria-hidden="true"` sur tous les emojis décoratifs
- `aria-current="page"` sur les liens de navigation actifs
- `aria-required="true"` sur les champs obligatoires
- `focus-visible:ring-2 focus-visible:ring-green-600` sur les éléments interactifs
- Direction HTML (`dir="ltr"` / `dir="rtl"`) respectée dans tous les composants
- Lighthouse Accessibilité : 100/100 (validé en production)

---

## RTL (arabe)

- `dir={locale === "ar" ? "rtl" : "ltr"}` sur `<html>` dans `[locale]/layout.tsx`
- Flèches inversées via `rtl:rotate-180` ou `rtl:hidden` + alternative
- Champs URL/téléphone/numéro toujours en `dir="ltr"` même en locale arabe
- Police Noto Sans Arabic chargée uniquement pour la locale `ar`

---

## Conventions de code

- **Pas de style inline** sauf pour les pages autonomes hors `[locale]`
  (`app/offline/page.tsx`, `app/not-found.tsx`) qui n'ont pas accès au layout
- **Pas d'emoji dans le code** sauf comme contenu visuel accessible
- **Tailwind uniquement** — pas de CSS custom sauf variables de police
