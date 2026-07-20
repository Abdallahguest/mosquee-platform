# Amana Connect — Vision long terme (la boussole)

> **⚠️ Ce document est une BOUSSOLE, pas un backlog.**
> Il décrit *où l'on va un jour*, jamais *ce qu'on code cette semaine*. Le plan d'action daté est dans [`FEUILLE-DE-ROUTE.md`](FEUILLE-DE-ROUTE.md) ; l'état réel du produit et de l'entreprise dans [`PASSATION-AMANA-CONNECT.md`](PASSATION-AMANA-CONNECT.md).
> **Règle qui gouverne tout ce fichier : aucun module ne se construit en avance sur la demande du terrain. Un module ne naît que lorsqu'une mosquée qui paie déjà le réclame par une visite.**
> Créé le 20 juillet 2026. À relire **une fois par trimestre** pour orienter — jamais pour justifier une session de code.

---

## 0. Pourquoi ce document existe (et le piège qu'il porte)

Cette vision est juste, inspirante, et cohérente. C'est exactement ce qui la rend dangereuse : **elle est la plus belle façon de ne pas aller sur le terrain.** Un ERP communautaire à 8 niveaux avec **0 mosquée payante vaut 0**. Le même produit d'aujourd'hui avec **une** mosquée qui paie vaut infiniment plus.

Elle est conservée ici pour une seule raison : **orienter les choix réversibles gratuits** (positionnement, frontières de modules, modèle de données) — sans jamais devenir une liste de choses à construire. Si l'ouverture de ce fichier déclenche une envie de coder, il a échoué.

---

## 1. Le reframe

Amana Connect n'est pas « une plateforme de gestion de mosquée ». C'est **le système d'information communautaire** : l'ERP de référence pour les mosquées, associations et centres islamiques africains.

Ce reframe est **gratuit** : il ne demande aucune ligne de code, seulement de changer la phrase qu'on dit à un imam.

- **En interne** (cap) : « système d'information communautaire ». ✅
- **En externe** (vente) : on ne décrit que ce qui **existe et fonctionne aujourd'hui**. Dire « l'ERP de référence » avec 4 mosquées et 0 revenu serait du *ghich*. On vend le tableau d'affichage réel, pas l'ERP futur.

**Mission :** permettre aux communautés de mieux s'organiser, communiquer, gérer leurs ressources et servir leurs membres, dans le respect des valeurs d'Amana Connect.

**Public visé (à terme) :** petites et grandes mosquées, centres islamiques, écoles coraniques, associations, ONG. *(Rappel : chaque nouveau type de public est un nouveau marché à valider, pas une case à cocher.)*

**Principes permanents :** Mobile-first · Offline-first · Multi-tenant · Modulaire.
> ⚠️ **« API-first » est aspirationnel, pas actuel.** Le projet est *délibérément* sans API REST (D-002 : Server Actions uniquement — moins de surface, moins de code). Aujourd'hui on est « Server-Actions-first », et c'est un bon choix. L'API n'apparaîtra que si/quand une intégration externe (ex. Wali) la rend nécessaire — c'est une décision future, pas la ligne présente.

---

## 2. Niveau 0 — La confiance avant les fonctionnalités *(ajout de valeur, non négociable)*

*Amana* = le dépôt de confiance. Un ERP qui détient les membres, les familles, les **enfants** (école), le **patrimoine** (waqf) et les **finances** d'une communauté porte une *amana* immense.

> **On ne gagne le droit de porter plus d'amana qu'en prouvant qu'on porte bien l'actuelle.**

Prérequis durs avant tout module détenant des données sensibles (donc **avant** L2 familles, et absolument avant L3 enfants / L4 patrimoine) :
- [ ] Bus factor cassé (2ᵉ super-admin scellé, doc de reprise chiffré) — cf FEUILLE-DE-ROUTE Phase 1.
- [ ] Procédures écrites (sauvegarde, restauration Neon **testée une fois**).
- [ ] Minimisation des données : on ne collecte que ce qui sert la communauté, jamais par défaut (extension de D-011).

---

## 3. Les 8 niveaux de maturité

Chaque niveau porte : un objectif, un **critère de succès en langage terrain** (comme le brillant L1), et une **note doctrinale**. *Si on ne peut pas écrire la phrase terrain, le module n'est pas mûr.*

### Niveau 1 — MVP « remplacer le tableau d'affichage »
- **Core :** auth, organisations, utilisateurs, rôles, synchronisation offline, paramètres.
- **Modules :** horaires de prière, Jumu'ah, compte à rebours, annonces, événements, infos mosquée, contacts.
- **Succès terrain :** *une mosquée peut jeter son tableau d'affichage.*
- **Doctrine :** anti-gharar (horaires datés/manuels), anti-jahàla (info claire). ✅ **Déjà fait à ~90 %.**

### Niveau 2 — Vie communautaire
- membres, familles, bénévoles, groupes, notifications, calendrier → puis inscriptions, participation, présences.
- **Succès terrain :** *l'imam sait qui appeler en cas de décès ou de besoin dans la communauté.*
- **Doctrine :** consentement explicite, minimisation (Niveau 0). Les données familiales sont sensibles.

### Niveau 3 — Éducation *(le module « Hafiz »)*
- élèves, enseignants, classes, présences, résultats, paiements → puis examens, diplômes, historique.
- **Succès terrain :** *une école coranique peut fonctionner entièrement dans la plateforme.*
- **⚠️ Ce n'est pas le niveau suivant, c'est un MARCHÉ suivant** (les écoles sont un autre client, un autre cycle de vente).
- **Doctrine :** enfants = amana maximale. « Paiements » = **affichage seul**, l'argent passe par un acteur régulé (voir §5).

### Niveau 4 — Patrimoine & administration *(le module « Waqf »)*
- Patrimoine : terrains, bâtiments, locaux, inventaire.
- Documents : contrats, archives, délibérations, rapports.
- Bibliothèque : livres, emprunts, ressources numériques.
- **Succès terrain :** *le comité retrouve un contrat ou une délibération en 30 secondes.*
- **Doctrine :** le waqf est un dépôt sacré — traçabilité, jamais d'altération silencieuse (anti-ghich).

### Niveau 5 — Vie financière communautaire
- dons, zakat, sadaqa, campagnes.
- **Règle absolue :** *Mihrab affiche, ne touche jamais.* Les paiements sont réalisés par un acteur régulé (Wali ou un PSP). La plateforme communautaire n'encaisse pas.
- **Succès terrain :** *une mosquée lance une campagne de rénovation et voit la collecte progresser, sans que la plateforme n'ait jamais tenu l'argent.*
- **Doctrine :** cœur de l'anti-riba. Aucune commission sur dons/zakat, jamais. 🟢 **Principe déjà vivant** (Orange Money en affichage seul).

### Niveau 6 — Communication
- SMS, WhatsApp, email, notifications push → puis site web automatique, application mobile, QR codes.
- **Succès terrain :** *chaque mosquée a une présence numérique sans jamais commander de site.*
- **Doctrine :** pas de spam (anti-israf de l'attention), opt-in clair. 🟡 Email ✓, WhatsApp manuel ✓, **site public auto ✓** déjà.

### Niveau 7 — Réseau communautaire
- jumelage, partage d'événements, bibliothèque commune, mutualisation → puis statistiques (fidèles, activités, rapports).
- **Succès terrain :** *deux mosquées partagent un événement ou une ressource sans intermédiaire.*
- **Doctrine :** statistiques **anonymisées par conception**, dès l'origine — règle dure, pas note de bas de page.

### Niveau 8 — Plateforme intelligente *(des années plus tard)*
- assistant (recherche, résumé, aide à la rédaction) → tableau de bord (tendances, participation, prévisions).
- **Succès terrain :** *un responsable gagne une heure par semaine, sans jamais déléguer une décision à la machine.*
- **Doctrine :** l'IA **assiste, ne décide jamais** ; ne devine pas sur des données personnelles ; ne présente jamais une prévision comme une certitude (anti-gharar).

---

## 4. Où en est le projet réel sur cette échelle (vérifié, 20/07/2026)

La vision n'est pas un *autre* projet — c'est le **superset** de ce qui existe déjà. L'app d'aujourd'hui est une graine fidèle de Mihrab, à **~1,5 niveau** :

| Niveau | État réel d'Amana Connect |
|:---:|---|
| **L1** Core + Modules | ✅ Fait à ~90 % |
| **L2** Vie communautaire | 🟡 Membres partiels ; familles/groupes/présences/push = ✗ |
| **L3** Éducation | ⬜ Rien (autre marché) |
| **L4** Patrimoine / Waqf | ⬜ Rien |
| **L5** Dons / Zakat | 🟢 Déjà conforme au principe (affichage seul, Orange Money) |
| **L6** Communication | 🟡 Email ✓, WhatsApp manuel ✓, site public auto ✓ ; push/SMS/QR ✗ |
| **L7** Réseau | ⬜ Rien |
| **L8** IA | ⬜ Rien |

**Conséquence :** selon le calendrier de la vision elle-même (« MVP en 6-12 mois »), le Niveau 1 est **déjà atteint**. Le travail de maintenant n'est donc **pas** de construire le Niveau 2 — c'est de **vendre le Niveau 1**.

---

## 5. Relation Mihrab / Wali — bon principe, mauvais moment pour deux produits

Deux choses à ne pas confondre :

- **Séparation *conceptuelle* (Mihrab ne touche jamais l'argent) → à garder.** Elle est déjà vivante, elle est halal, c'est la meilleure frontière du projet.
- **Séparation *en deux plateformes avec API sécurisée* → à NE PAS construire maintenant.** Raisons alignées sur les valeurs :
  - **Israf + fragilité :** deux produits = double surface pour un solo dev sur mauvais réseau. Un **monolithe modulaire** (l'architecture actuelle) porte cette vision pendant des *années* sans se scinder.
  - **Réalité réglementaire :** une plateforme qui *touche* l'argent en zone UEMOA est un **établissement de paiement** (agrément BCEAO ou partenariat PSP licencié). C'est une *autre entreprise*, régulée, capitalistique — ce qui contredit « sans capital de départ ».
  - **Périmètre :** « Wali peut aussi servir commerçants/PME » = explosion vers la fintech, brutale et régulée. Ne pas laisser un joli diagramme faire construire une fintech avant 10 mosquées payantes.

> **Wali, s'il se fait un jour, est sa propre entreprise, avec son propre chemin juridique, découplée de la feuille de route de Mihrab.** Aujourd'hui, le lien « Faire un don » reste ce qu'il est déjà : un lien Orange Money. Pas besoin d'API pour ça.

```text
                 Amana Connect (les valeurs communes)
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                        ▼
   Mihrab — communauté                     Wali — finance (un jour,
   (CE PROJET, aujourd'hui)                 entreprise séparée & régulée)
   « affiche, ne touche pas »               « touche l'argent »
          └───────── lien simple (pas d'API pour l'instant) ─────────┘
```

---

## 6. Les 6 améliorations propres à tes valeurs (ce qui rend la vision *tienne*)

1. **Niveau 0 « confiance avant fonctionnalités »** (§2) — gagner le droit de porter plus d'amana.
2. **Minimisation des données** comme principe, extension de D-011 (« aucune photo » → « aucune donnée superflue »).
3. **La règle de l'argent gravée dans l'architecture** : *Mihrab affiche, ne touche jamais ; aucune commission sur dons/zakat.*
4. **Le filtre doctrinal (4 interdits + israf) appliqué à *chaque* module** avant de le construire.
5. **Chaque niveau reformulé en langage terrain** (fait au §3) — le test de maturité.
6. **Note d'architecture, pas chantier** : le tenant s'appelle `mosque` ; la vision parle d'`organisation`. **Ne rien renommer maintenant** (israf à 4 mosquées). Option gardée en tête : le jour où une école ou une association veut *payer*, le concept `organisation` deviendra utile.

---

## 7. Comment cette vision s'articule avec le plan (garde-fou anti-israf)

| Phase (FEUILLE-DE-ROUTE) | Ce que la vision autorise |
|---|---|
| **Phase 0-1** (→ 10 payantes) | **RIEN.** Zéro nouveau niveau. La vision ne change pas une virgule de ce qu'on fait. |
| **Phase 2** (~50 payantes) | Modules L2/L6 **tirés** par des mosquées qui paient déjà (ex. notifications, groupes). |
| **Phase 3** (~200) | L3 éducation comme **nouveau marché** validé par le terrain (écoles coraniques). |
| **Phase 4+** | L4 waqf, L7 réseau. Réflexion sur Wali *seulement* si une demande financière réelle et régulée existe. |
| **Horizon lointain** | L8 IA, dans le respect de « assiste, ne décide jamais ». |

---

## 8. La vérité qui prime (toujours)

Cette vision pourrait décrire une entreprise valant bien plus qu'un SaaS de mosquées. Rien n'y est faux. Mais aucune de ses 8 strates ne change le seul chiffre qui bloque tout :

> **Cette semaine, combien de conversations de vente ?**

**Garde la vision. Encadre-la. Va vendre le tableau d'affichage.**
