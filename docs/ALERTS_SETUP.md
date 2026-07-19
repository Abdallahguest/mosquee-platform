# Guide de Configuration des Alertes Super-Admin

Ce guide explique comment configurer les alertes en temps réel pour les actions super-admin sensibles via Slack, SMS (Twilio) et Email.

## Vue d'Ensemble

Le système d'alertes envoie des notifications pour les actions critiques :
- Suppression utilisateur/mosquée
- Désactivation MFA
- Récupération d'urgence
- Changement de rôle utilisateur

Les alertes sont envoyées via 3 canaux (configurables indépendamment) :
1. **Slack Webhook** : Notifications instantanées dans un canal Slack
2. **SMS (Twilio)** : Alertes SMS pour urgence absolue
3. **Email** : Copies aux super-admins supplémentaires

## 1. Configuration Slack Webhook

### Créer un Webhook Slack

1. Allez dans [Slack API](https://api.slack.com/apps)
2. Cliquez sur **"Create New App"**
3. Choisissez **"From scratch"**
4. Nommez l'app (ex: "Amana Connect Alerts")
5. Sélectionnez votre workspace Slack
6. Allez dans **"Incoming Webhooks"**
7. Activez **"Activate Incoming Webhooks"**
8. Cliquez sur **"Add New Webhook to Workspace"**
9. Sélectionnez le canal où recevoir les alertes (ex: `#super-admin-alerts`)
10. Copiez l'URL du webhook (commence par `https://hooks.slack.com/...`)

### Configurer dans Vercel

1. Allez dans votre projet Vercel
2. **Settings** → **Environment Variables**
3. Ajoutez :
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXXX/XXXXX/XXXXX
   ```

### Tester le Webhook

Créez un fichier de test `test-slack-alert.ts` :

```typescript
import { sendSlackAlert } from "./src/lib/alerts"

async function test() {
  await sendSlackAlert({
    action: "TEST_ALERT",
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
    details: "Ceci est un test d'alerte Slack",
    ipAddress: "127.0.0.1",
  })
  
  console.log("Slack alert sent")
}

test()
```

Exécutez avec :
```bash
npx tsx test-slack-alert.ts
```

Vérifiez que le message apparaît dans votre canal Slack.

---

## 2. Configuration SMS (Twilio)

### Créer un Compte Twilio

1. Allez sur [Twilio Console](https://console.twilio.com)
2. Créez un compte gratuit (ou connectez-vous)
3. Vérifiez votre numéro de téléphone
4. Notez vos identifiants :
   - Account SID
   - Auth Token

### Acheter un Numéro de Téléphone

1. Allez dans **Phone Numbers** → **Buy a Number**
2. Choisissez un numéro dans votre pays
3. Sélectionnez les capacités :
   - ✅ SMS
   - ✅ Voice (optionnel)
4. Achetez le numéro (environ $1/mois)

### Configurer dans Vercel

Ajoutez les variables d'environnement :

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+33612345678
TWILIO_ALERT_NUMBERS=+33698765432,+33611111111
```

- `TWILIO_FROM_NUMBER` : Le numéro Twilio acheté
- `TWILIO_ALERT_NUMBERS` : Numéros des super-admins (séparés par virgules)

### Tester les SMS

Créez un fichier de test `test-sms-alert.ts` :

```typescript
import { sendSMSAlert } from "./src/lib/alerts"

async function test() {
  await sendSMSAlert({
    action: "TEST_SMS",
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
    details: "Ceci est un test d'alerte SMS",
  })
  
  console.log("SMS alert sent")
}

test()
```

Exécutez avec :
```bash
npx tsx test-sms-alert.ts
```

Vérifiez que vous recevez le SMS sur les numéros configurés.

---

## 3. Configuration Email

### Configurer les Emails d'Alerte

Ajoutez la variable d'environnement :

```
SUPER_ADMIN_ALERT_EMAILS=admin1@amanaconnect.org,admin2@amanaconnect.org
```

Les alertes email utilisent la même configuration Resend que les autres emails.

### Tester les Emails

Créez un fichier de test `test-email-alert.ts` :

```typescript
import { sendEmailAlert } from "./src/lib/alerts"

async function test() {
  await sendEmailAlert({
    action: "TEST_EMAIL",
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
    details: "Ceci est un test d'alerte email",
  })
  
  console.log("Email alert sent")
}

test()
```

---

## 4. Actions qui Déclenchent des Alertes

Les actions suivantes déclenchent des alertes automatiques :

### Suppression de Données
- `user.delete` : Suppression d'un utilisateur
- `mosque.delete` : Suppression d'une mosquée

### Sécurité
- `mfa.disabled` : Désactivation de MFA
- `emergency_recovery.completed` : Récupération d'urgence complétée

### Changements de Rôle
- `user.update.role` : Changement de rôle utilisateur (à implémenter)

### Abonnements
- `mosque.update.subscription` : Modification d'abonnement (à implémenter)

---

## 5. Personnalisation des Alertes

### Modifier le Format Slack

Le format des messages Slack est dans `src/lib/alerts.ts` :

```typescript
const message = {
  text: `⚠️ Action Super-Admin Critique : ${payload.action}`,
  blocks: [
    // Personnalisez les blocs ici
  ],
}
```

Vous pouvez ajouter :
- Emoji spécifiques par type d'action
- Couleurs (via `attachments`)
- Boutons d'action rapides

### Modifier le Contenu SMS

Le message SMS est dans `src/lib/alerts.ts` :

```typescript
const message = `[AMANA ALERT] ${payload.action} by ${payload.user.name} (${payload.user.email})`
```

Notez la limite de 160 caractères pour les SMS.

---

## 6. Surveillance et Dépannage

### Vérifier les Logs

Les erreurs d'envoi d'alertes sont loggées dans la console :
```
Failed to send Slack alert: ...
Failed to send SMS alert: ...
Failed to send email alert: ...
```

Ces erreurs ne bloquent pas l'action principale.

### Tester en Production

Pour tester sans déclencher de vraies alertes :

1. Utilisez un environnement de staging
2. Ou commentez temporairement les appels d'alerte dans `super-admin-logger.ts`

### Désactiver un Canal

Pour désactiver un canal sans modifier le code, laissez la variable d'environnement vide :

```
SLACK_WEBHOOK_URL=
TWILIO_ACCOUNT_SID=
SUPER_ADMIN_ALERT_EMAILS=
```

---

## 7. Bonnes Pratiques

### Sécurité
- Ne commitez jamais les clés API dans le code
- Utilisez des variables d'environnement
- Limitez les permissions des webhooks Slack
- Utilisez des numéros Twilio vérifiés

### Performance
- Les alertes sont envoyées en parallèle (`Promise.allSettled`)
- Les erreurs ne bloquent pas l'action principale
- Les alertes sont asynchrones et non bloquantes

### Coûts
- Slack Webhook : Gratuit
- Twilio SMS : ~$0.05/SMS (varie par pays)
- Email : Inclus dans Resend (jusqu'à 3000 emails/mois gratuit)

---

## 8. Checklist de Déploiement

- [ ] Slack Webhook créé et testé
- [ ] Twilio créé et numéro acheté
- [ ] Variables d'environnement configurées
- [ ] Alertes testées individuellement
- [ ] Canal Slack configuré pour les alertes
- [ ] Numéros SMS des super-admins ajoutés
- [ ] Emails des super-admins ajoutés
- [ ] Documentation mise à jour
- [ ] Équipe informée du nouveau système d'alertes

---

## Support

- Slack API : https://api.slack.com
- Twilio Docs : https://www.twilio.com/docs
- Resend Docs : https://resend.com/docs
