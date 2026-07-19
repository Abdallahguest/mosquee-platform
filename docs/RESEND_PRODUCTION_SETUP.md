# Guide de Configuration Resend en Mode Production

Ce guide explique comment passer Resend du mode test au mode production pour permettre l'envoi d'emails réels aux utilisateurs.

## État Actuel

Resend est actuellement en **mode test** :
- Les emails ne sont envoyés qu'à l'adresse du propriétaire du compte (`abdallahmarly90@gmail.com`)
- L'inscription self-service ne peut pas fonctionner (les utilisateurs ne reçoivent pas l'email de vérification)
- La récupération de mot de passe ne fonctionne pas

## Étapes pour Passer en Production

### 1. Vérifier le Domaine DNS

Assurez-vous que votre domaine `amanaconnect.org` est configuré avec les enregistrements DNS requis par Resend :

```
Type: TXT
Name: _dmarc.amanaconnect.org
Value: v=DMARC1; p=none

Type: TXT
Name: amanaconnect.org
Value: v=spf1 include:resend.com ~all
```

Pour vérifier :
```bash
dig TXT amanaconnect.org
dig TXT _dmarc.amanaconnect.org
```

### 2. Vérifier le Domaine dans Resend

1. Connectez-vous à [Resend Dashboard](https://resend.com/dashboard)
2. Allez dans **Domains** → **amanaconnect.org**
3. Vérifiez que le statut est **"Verified"**
4. Notez l'adresse d'envoi vérifiée (ex: `noreply@mail.amanaconnect.org`)

### 3. Valider le Compte Resend

Pour passer en production, Resend peut demander de valider votre compte :

1. Allez dans **Settings** → **Account**
2. Complétez les informations requises :
   - Nom de l'organisation
   - Adresse physique
   - Numéro de téléphone
   - Site web
3. Soumettez pour validation
4. Attendez l'approbation (peut prendre 24-48h)

### 4. Mettre à jour les Variables d'Environnement

Dans Vercel (ou votre `.env.local` en local) :

```bash
# Clé API Resend (déjà configurée)
RESEND_API_KEY=re_xxxxxxxxxxxxxx

# Adresse expéditeur (doit être le domaine vérifié)
EMAIL_FROM=noreply@mail.amanaconnect.org
EMAIL_FROM_NAME=Amana Connect
```

### 5. Tester l'Envoi d'Email

Créez un fichier de test temporaire `test-email.ts` :

```typescript
import { sendEmail } from "./src/lib/email"

async function test() {
  const result = await sendEmail({
    to: "votre-email-personnel@gmail.com",
    subject: "Test Resend Production",
    html: "<h1>Test réussi !</h1><p>Resend est maintenant en mode production.</p>"
  })
  
  console.log(result)
}

test()
```

Exécutez avec :
```bash
npx tsx test-email.ts
```

### 6. Vérifier les Logs Resend

1. Allez dans [Resend Logs](https://resend.com/dashboard/logs)
2. Vérifiez que l'email a été envoyé avec succès
3. Vérifiez qu'il n'y a pas d'erreurs de bounce ou spam

## Flux qui Dépendent de Resend

Une fois en production, ces flux fonctionneront :

### Inscription Self-Service
- L'utilisateur reçoit un email de vérification
- Il doit cliquer sur le lien pour activer son compte
- Sans email, le compte reste `emailVerified: false`

### Réinitialisation de Mot de Passe
- L'utilisateur reçoit un lien de reset
- Le lien expire après 1 heure
- Permet de récupérer l'accès sans intervention admin

### Récupération d'Urgence (Super-Admin)
- Le lien de récupération est envoyé à l'`emergencyEmail`
- Permet de récupérer un compte super-admin compromis

## Surveillance et Maintenance

### Vérifier la Réputation

Resend surveille votre réputation d'envoi :
- Taux de bounce (emails non délivrables)
- Taux de spam (marqués comme spam par les destinataires)
- Taux de plaintes

Si ces taux sont trop élevés, Resend peut suspendre votre compte.

### Configurer le Webhook (Optionnel)

Pour recevoir des notifications sur les événements email :

1. Allez dans **Webhooks** dans Resend
2. Ajoutez un endpoint : `https://amanaconnect.org/api/webhooks/resend`
3. Sélectionnez les événements à surveiller :
   - `email.delivered`
   - `email.bounced`
   - `email.complained`
   - `email.opened` (optionnel)

### Limiter le Volume

Pour éviter les abus, configurez des limites dans Resend :
- **Daily limit** : 1000 emails/jour (ajustable)
- **Rate limit** : 10 emails/minute par IP

## Dépannage

### Email Non Reçu

1. Vérifiez le dossier spam
2. Vérifiez les logs Resend
3. Vérifiez que l'adresse email est valide
4. Vérifiez que le domaine n'est pas blacklisté

### Erreur "Domain Not Verified"

1. Vérifiez les enregistrements DNS SPF/DMARC
2. Attendez la propagation DNS (jusqu'à 48h)
3. Contactez le support Resend

### Erreur "Account Not Verified"

1. Complétez les informations de compte dans Resend
2. Attendez l'approbation
3. Contactez le support Resend si nécessaire

## Checklist de Déploiement

- [ ] Domaine DNS configuré (SPF/DMARC)
- [ ] Domaine vérifié dans Resend
- [ ] Compte Resend validé
- [ ] Variables d'environnement mises à jour
- [ ] Test d'envoi d'email réussi
- [ ] Logs Resend vérifiés
- [ ] Webhook configuré (optionnel)
- [ ] Limites de volume configurées
- [ ] Documentation mise à jour

## Contact Support

Si vous rencontrez des problèmes :
- Resend Support : support@resend.com
- Documentation : https://resend.com/docs
