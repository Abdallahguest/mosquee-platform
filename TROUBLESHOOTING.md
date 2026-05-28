# 🔧 Résolution du problème de connexion à la base de données

## ❌ Erreur rencontrée

```
Error: Failed query: select ... from "mosques"
Error connecting to database: TypeError: fetch failed
```

## 🎯 Solutions

### Solution 1 : Vérifier la connexion internet

La base de données Neon est hébergée en ligne. Assurez-vous d'avoir une connexion internet active.

```bash
# Testez votre connexion
ping google.com
```

### Solution 2 : Créer les tables dans la base de données

Les tables n'existent peut-être pas encore. Exécutez :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis exécutez :
pnpm db:push
```

**Attendez que la commande se termine** (peut prendre 30-60 secondes).

### Solution 3 : Ajouter des données de test

Une fois les tables créées, ajoutez des données :

```bash
pnpm db:seed
```

### Solution 4 : Vérifier le fichier .env.local

Assurez-vous que le fichier `.env.local` existe à la racine du projet avec :

```env
DATABASE_URL=postgresql://...votre_url_neon...
BETTER_AUTH_SECRET=...votre_secret...
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Solution 5 : Redémarrer le serveur

Après avoir créé les tables et ajouté les données :

```bash
pnpm dev
```

## 📋 Checklist complète

- [ ] ✅ Connexion internet active
- [ ] ✅ Fichier `.env.local` existe avec `DATABASE_URL`
- [ ] ✅ Tables créées avec `pnpm db:push`
- [ ] ✅ Données ajoutées avec `pnpm db:seed`
- [ ] ✅ Serveur redémarré avec `pnpm dev`

## 🔍 Vérification de la base de données

Pour visualiser vos données :

```bash
pnpm db:studio
```

Cela ouvrira Drizzle Studio dans votre navigateur pour voir les tables et les données.

## 🆘 Si le problème persiste

1. **Vérifiez que votre base Neon est active** :
   - Connectez-vous à [console.neon.tech](https://console.neon.tech)
   - Vérifiez que votre projet est actif
   - Copiez à nouveau la connection string

2. **Testez la connexion manuellement** :
   ```bash
   # Créez un fichier test-db.ts
   import { db } from "./src/db/index"
   console.log("Testing connection...")
   db.select().from(mosques).then(console.log)
   ```

3. **Vérifiez les logs Neon** :
   - Dans la console Neon, allez dans "Monitoring"
   - Vérifiez s'il y a des erreurs de connexion

## ✅ Page d'erreur améliorée

La page d'accueil affiche maintenant un message d'erreur détaillé si la connexion échoue, avec des instructions pour résoudre le problème.

## 🚀 Ordre d'exécution recommandé

```bash
# 1. Arrêter le serveur si il tourne
Ctrl+C

# 2. Créer les tables
pnpm db:push

# 3. Ajouter les données
pnpm db:seed

# 4. Relancer le serveur
pnpm dev

# 5. Ouvrir http://localhost:3000
```

**Temps estimé : 2-3 minutes** ⏱️
