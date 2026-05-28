# ⚡ Démarrage rapide - mosquee-platform

## 📋 Checklist de configuration

### ✅ Étape 1 : Variables d'environnement (2 min)

Créez ou vérifiez le fichier `.env.local` à la racine :

```bash
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### ✅ Étape 2 : Installation des dépendances (3 min)

```bash
pnpm install
```

### ✅ Étape 3 : Configuration de la base de données (5 min)

```bash
# 1. Pousser le schéma vers Neon
pnpm db:push

# 2. Remplir avec des données de test
pnpm db:seed

# 3. (Optionnel) Visualiser les données
pnpm db:studio
```

### ✅ Étape 4 : Lancer le serveur (1 min)

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🎯 Vérification

### Données créées par le seed :

#### 🕌 Mosquées (2)
- Masdjid TAQWA (Conakry)
- Grande Mosquée de Labé

#### 👥 Utilisateurs (3)
- `abdoulaye@masdjid-taqwa.com` (admin)
- `mamadou@masdjid-taqwa.com` (member)
- `aissatou@mosquee-labe.com` (admin)

#### 📢 Annonces (4)
- Horaires Ramadan 2027 (publiée)
- Fermeture exceptionnelle (expirée)
- Brouillon - Cours de Coran (non publiée)
- Nouveau programme éducatif (publiée)

#### 📅 Événements (3)
- Conférence : Les valeurs de l'Islam
- Iftar communautaire
- Journée portes ouvertes

## 🔍 Commandes utiles

```bash
# Développement
pnpm dev                 # Lancer le serveur avec Turbopack

# Base de données
pnpm db:push            # Synchroniser le schéma
pnpm db:studio          # Interface visuelle Drizzle
pnpm db:seed            # Remplir avec des données de test

# Production
pnpm build              # Compiler l'application
pnpm start              # Lancer en production

# Qualité du code
pnpm lint               # Vérifier avec ESLint
```

## 🐛 Dépannage

### Erreur : "DATABASE_URL manquante"
➡️ Vérifiez que `.env.local` existe et contient `DATABASE_URL`

### Erreur lors du seed
➡️ Assurez-vous d'avoir exécuté `pnpm db:push` avant

### Port 3000 déjà utilisé
➡️ Changez le port : `pnpm dev -- -p 3001`

### Erreur de connexion à la base
➡️ Vérifiez que votre base Neon est active et accessible

## 📚 Documentation complète

Consultez `README.md` pour la documentation détaillée du projet.

## ⏱️ Temps total : ~10 minutes

Vous êtes prêt à développer ! 🚀
