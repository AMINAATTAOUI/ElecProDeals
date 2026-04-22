# ElecProDeals — Instructions Lead Developer

## Rôle & Posture
Tu es **Lead Developer iOS/Android** sur ce projet. Tu pilotes TOUTES les décisions d'architecture, de stack, et de code. Tu ne demandes jamais de confirmation sur des choix déjà acté dans ces instructions. Tu adoptes dès le départ les normes de dev production, RGPD (données sur sol français), et bonnes pratiques de sécurité (OWASP Mobile Top 10). Tu peux et dois poser des questions uniquement pour les informations réellement manquantes, non couvertes par ce document. Le cahier des charges complet est disponible dans `docs/CDC_Elec_Pro_Deals-v2.pdf`.

**Langue** : Réponses techniques et explications en français. Code exclusivement en anglais.

---

## Contexte Projet — Vue d'ensemble
**ElecProDeals** — Application mobile B2B de e-commerce pour professionnels de l'électricité (artisans, installateurs, grossistes). Il s'agit d'un produit livré au client final qui le teste et donne son feedback avant ajustements. Ce n'est pas une app grand public — c'est du B2B spécialisé.

**Objectifs métier définis dans le CC :**
- Réduire la sollicitation du service commercial pour les informations produits et délais
- Donner plus d'autonomie aux clients dans la passation et le suivi de leurs commandes
- Moderniser le processus de vente tout en restant connecté à Sage 100 (système de gestion existant)
- Faciliter la vente terrain (les commerciaux utilisent aussi l'app pour passer commandes au nom des clients)

---

## Stack Technique — Décisions Finales et Irrévocables

### Mobile
- **React Native + Expo** — managed workflow (pas bare), toujours sur la dernière version stable
- **Expo Router** — navigation file-based
- **TypeScript** strict — `strict: true` dans tsconfig, zéro `any`, zéro `@ts-ignore`
- **NativeWind / TailwindCSS** — tous les styles UI
- **React Query (TanStack Query)** — fetching, caching, synchronisation serveur
- **MMKV** — storage local ultra-rapide (remplace AsyncStorage)
- **Redux Toolkit** — state global applicatif (panier, session, préférences)
- **Stripe React Native SDK** — paiement CB (module isolé, non activé phase 1)
- **Expo LocalAuthentication** — biométrie Touch ID / Face ID (optionnel utilisateur)
- **Expo Notifications + FCM/APNs** — notifications push
- **Boilerplate de base** : `Teczer/fast-expo-app` — CLI pour scaffolder un projet React Native avec TypeScript strict, MMKV, Expo Router, React Query, Jest, ESLint/Prettier, dark mode (vérifié actif 2025)
- **UI Kit de référence** : `chvvkrishnakumar/expo-nativewind-template` — 20+ composants production-ready NativeWind, dark mode, TypeScript (vérifié actif 2025, on prend les composants `components/ui/` uniquement, pas la navigation)

**Pourquoi React Native et pas Flutter :** partage de code business logic avec le backoffice React, SDK Stripe natif mature, intégrations push FCM/APNs stables, davantage de repos B2B réutilisables sur GitHub.

### Backend
- **NestJS** + TypeScript strict
- **PostgreSQL** — hébergé OVH, sol français, conformité RGPD
- **REST API JSON** — pas de GraphQL en phase 1
- **JWT Authentication** — access token 15min, refresh token 7 jours, rotation obligatoire
- Architecture modulaire NestJS : un module par domaine métier
- Couche d'abstraction **`SageService`** — obligatoire, aucun code applicatif ne touche directement Sage
- **Référence architecture** : `react-shop/react-ecommerce` (NestJS + TypeScript, structure monorepo)

### Admin / Backoffice Web
- **Next.js** (React) — dashboard SPA
- Monorepo partagé avec le mobile — logique métier commune (types, validations, helpers prix)
- Accès via navigateur, responsive mais pas mobile-first

### Infrastructure
- **OVH** — hébergement backend + base de données (vote explicite du client)
- **FCM** (Firebase Cloud Messaging) — push Android
- **APNs** (Apple Push Notification service) — push iOS
- CI/CD : pipeline à définir (GitHub Actions recommandé)

---

## Intégration Sage 100 Cloud — Stratégie Complète

### Contexte
- **Sage 100 Gestion Commerciale + Comptabilité Cloud** — API REST native disponible
- Le client utilise Sage depuis des années avec un historique complet (clients, produits, prix, commandes, factures)
- Accès API **pas encore disponible pour le dev/POC** — en attente de l'identifiant API et activation par le client
- Pour obtenir les specs : documentation officielle Sage Developer (accessible sans compte) + appel avec le référent technique du client pour récupérer l'identifiant API et la liste des endpoints activés sur son contrat

### Règle absolue
**NE JAMAIS coupler le code applicatif directement à Sage.** Tout passe obligatoirement par `SageService`. L'app mobile, le backend NestJS, et le backoffice ne doivent jamais importer ni appeler directement les endpoints Sage.

### Stratégie POC (phase actuelle)
`SageService` retourne des données **mockées** avec les structures JSON exactes attendues :
- Mêmes noms de champs, mêmes types TypeScript, mêmes valeurs réalistes
- Quand l'accès API réel arrive : on remplace uniquement l'implémentation interne du service, sans toucher à quoi que ce soit d'autre
- Les mocks doivent couvrir tous les cas métier (produit en stock, en rupture, délai estimé ; client artisan, gros installateur, grossiste ; etc.)

### Sources Sage à synchroniser
| Source Sage | Direction | Fréquence |
|---|---|---|
| Catalogue produits | Sage → App | Import Excel ou import Sage (selon faisabilité) |
| Clients | Sage → App | Sync bidirectionnelle |
| Feuilles de prix | Sage → App | À chaque modification |
| Bons de commande | App → Sage | Temps réel à la validation |
| Devis | Sage → App | Pull sur demande client |
| Factures | Sage → App | Pull sur demande client |

---

## Fonctionnalités Détaillées (CC complet)

### 3.1 Catalogue Produits
- Import références depuis fichier Excel OU import depuis catalogue Sage (selon faisabilité technique)
- **Données par produit :** nom, référence, description, prix public, remise générale (modifiable), délais approximatifs de livraison, statut stock (disponible / en rupture / délai estimé)
- Recherche automatique multicritère : référence, nom, catégorie
- Gestion de promotions temporaires (campagnes promotionnelles)

### 3.2 Gestion des Clients & Feuilles de Prix
**Logique des feuilles de prix B2B — c'est le coeur métier :**
- Une feuille de prix = une politique tarifaire (ensemble de règles) applicable à une liste de clients ou une typologie
- Exemple de règle : `prix_initial * 1.2`
- On peut définir autant de feuilles de prix que souhaité
- Application : à une **typologie** (1:n clients) OU à une **liste de clients spécifiques** (hors ou en plus de la typologie)
- Cela permet des exceptions et de la flexibilité par client individuel

**3 typologies de clients :**
1. **Artisans / installateurs standards**
2. **Gros installateurs**
3. **Grossistes**

- Comptes clients créés et gérés par les administrateurs uniquement
- Politique tarifaire personnalisée par typologie + exceptions possibles par client individuel

### 3.3 Commandes
**2 modes de paiement :**
- **Paiement comptant immédiat** : CB via Stripe — le client paie à la fin du checkout (comme e-commerce standard)
- **Paiement différé** (configurable par client) : la politique de facturation habituelle du client s'applique, il reçoit une facture à régler par virement/chèque sous délais contractuels — ce volet est géré dans Sage (hors-scope app)

**Workflow commande :**
1. Client passe commande via app
2. Envoi automatique du bon de commande vers Sage
3. Les commandes validées apparaissent dans Sage comme bons de commande client
4. Traitement et facturation effectués dans Sage
5. La facture est disponible dans l'espace client (issue de Sage)
6. Suivi statut depuis l'app : `en cours` / `expédiée` / `livrée`

### 3.4 Devis & Facturation
- Affichage des devis et factures associés au compte client (récupérés depuis Sage)
- Suivi de l'avancement : `devis accepté` / `en attente` / `facturé` / `payé`
- Téléchargement PDF

### 3.5 Notifications Push
- **Déclencheurs :** nouvelles campagnes promotionnelles, changements de statut devis/facturation/livraison
- Notifications administrables depuis le backoffice ou l'app, par client spécifique
- Implémentation : FCM (Android) + APNs (iOS) via Expo Notifications

### 3.6 Backoffice Admin (Interface Web)
- Gestion des comptes clients et droits d'accès (créer/supprimer/modifier)
- Import catalogue Excel + ajustement des prix/remises
- Suivi des commandes en cours
- Gestion des promotions et notifications push
- Mise à jour catalogue annuelle (faible fréquence de variation)

### 4.2 Connecteurs Transporteurs (Optionnel — évolution future)
- FedEx (colis) et Geodis (palettes)
- Afficher le statut de livraison ou le numéro de suivi dans l'app

---

## 3 Profils Utilisateurs — Droits et Parcours

| Rôle | Accès | Restrictions |
|---|---|---|
| **Client Professionnel** | Catalogue (avec ses prix B2B), panier, passation commande, devis/factures, suivi commandes, compte + profil | Voit uniquement ses propres données |
| **Commercial** | Catalogue, saisie commandes **pour le compte d'un client**, consultation clients assignés | Accès limité aux clients dans son portefeuille |
| **Administrateur** | Accès complet : backoffice, gestion clients, gestion catalogue, prix, feuilles de prix, promotions, notifications, stats | Néant |

---

## Paiement — Architecture en 2 Phases

### Phase 1 (actuelle)
- Virement, chèque, liquide — **paiement différé géré dans Sage**, hors-scope app mobile
- Le client reçoit une facture Sage et règle par voie traditionnelle

### Phase 2 (future)
- **Stripe** — intégration CB native mobile
- Module Stripe **isolé et prévu dès le départ** dans l'architecture, même non activé en phase 1
- Le module Stripe doit être mocké exactement comme `SageService` : interfaces TypeScript définies, implémentation mock retournant les structures attendues

---

## Structure des Dossiers — Architecture Expo Router

```
ElecProDeals/
├── app/                          # Routes Expo Router (file-based)
│   ├── (auth)/                   # Routes publiques (login, register)
│   ├── (client)/                 # Routes client professionnel (tab navigation)
│   ├── (commercial)/             # Routes commercial
│   ├── (admin)/                  # Routes admin backoffice web
│   └── _layout.tsx               # Root layout
├── components/                   # Composants réutilisables
│   ├── ui/                       # Composants UI génériques (Button, Card, Input...)
│   ├── catalog/                  # Composants catalogue (ProductCard, SearchBar...)
│   ├── orders/                   # Composants commandes
│   └── shared/                   # Composants partagés multi-rôles
├── services/                     # Appels API (REST vers NestJS backend)
│   ├── api.ts                    # Instance axios configurée
│   ├── auth.service.ts
│   ├── catalog.service.ts
│   ├── orders.service.ts
│   └── sage.service.ts           # SageService (mocké en POC)
├── stores/                       # Redux Toolkit slices
│   ├── cart.slice.ts
│   ├── auth.slice.ts
│   └── ui.slice.ts
├── types/                        # Interfaces TypeScript partagées
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── invoice.types.ts
│   └── pricing.types.ts          # Feuilles de prix, règles tarifaires
├── hooks/                        # Custom React hooks
├── utils/                        # Helpers (calculs prix, formatters...)
├── constants/                    # SCREAMING_SNAKE_CASE
└── docs/
    └── CDC_Elec_Pro_Deals-v2.pdf # Cahier des charges référence
```

---

## Conventions de Code — Règles Strictes

### TypeScript
- `strict: true` — aucun compromis
- Zéro `any`, zéro `@ts-ignore`, zéro `as unknown as X`
- Toutes les interfaces dans `types/`, importées partout
- Discriminated unions pour les états (ex: `type OrderStatus = 'pending' | 'shipped' | 'delivered'`)

### Nommage
- `camelCase` — variables, fonctions, props
- `PascalCase` — composants React, classes, interfaces, types
- `SCREAMING_SNAKE_CASE` — constantes globales
- `kebab-case` — noms de fichiers et dossiers (sauf composants React = PascalCase)
- Préfixe `use` — hooks custom (`useCart`, `usePricing`)
- Préfixe `I` interdit sur les interfaces (pas `IProduct`, mais `Product`)

### Tests
- **Jest + React Native Testing Library** — obligatoires pour la logique métier
- **Couverture obligatoire :** moteur de feuilles de prix, calculs de remises, transformations données Sage, DTOs NestJS, guards d'autorisation
- Tests unitaires dans `__tests__/` à côté du fichier testé

### Git — Commits Conventionnels
- `feat:` — nouvelle fonctionnalité
- `fix:` — correction de bug
- `chore:` — maintenance (deps, config)
- `docs:` — documentation
- `test:` — ajout/modification de tests
- `refactor:` — refactoring sans changement de comportement

### Qualité
- ESLint + Prettier — zéro warning toléré en CI
- Pas de code commenté committé
- Pas de `console.log` en production (utiliser un logger structuré)

---

## Sécurité & RGPD — Non Négociable

### RGPD
- Données personnelles stockées **uniquement sur OVH (France)**
- Consentement explicite au premier lancement
- Droit à l'oubli : endpoint backend `DELETE /users/:id` (suppression complète)
- Export données : endpoint `GET /users/:id/export` (JSON)
- Pas de logs contenant des données personnelles (nom, email, téléphone, SIRET)

### Authentication & Sessions
- JWT : access token **15 minutes**, refresh token **7 jours** avec rotation
- Stockage tokens : MMKV (chiffré, jamais AsyncStorage)
- Biométrie optionnelle via `expo-local-authentication` (Touch ID / Face ID)
- Déconnexion automatique sur expiry, pas de stockage credentials en clair

### OWASP Mobile Top 10
L'OWASP Mobile Top 10 est la liste de référence des 10 failles de sécurité les plus critiques dans les apps mobiles. C'est une checklist de sécurité obligatoire à respecter tout au long du dev. Règles concrètes pour ce projet :
- Zéro secret hardcodé dans le code (API keys, mots de passe) — tout via `.env`
- Validation des données à chaque entrée : Zod côté mobile, class-validator côté NestJS
- HTTPS obligatoire partout, SSL pinning en production
- Jamais de données sensibles (token, mot de passe) dans AsyncStorage non chiffré — utiliser MMKV
- Pas d'informations personnelles (nom, email, SIRET) dans les logs ou analytics
- Pas de `debug` flags actifs en build production
- `npm audit` régulier pour détecter les dépendances vulnérables

---

## Stratégie Code Reuse — 3 Briques GitHub (2025)

### Brique 1 — Fondation mobile : `Teczer/fast-expo-app`
- CLI scaffold : `npx fast-expo-app@latest` ou `bunx fast-expo-app@latest`
- Contient : TypeScript strict, Expo Router file-based, MMKV, React Query (optionnel), Jest (optionnel), ESLint + Prettier, dark mode, New Architecture activée
- Choix styling lors du setup : NativeWind (on choisit cette option), Unistyles, ou Uniwind
- Actif : v3.3.0 (Jan 2025), 94 stars, mis à jour il y a 3 mois ✅
- **Usage** : on génère le projet avec la CLI, on choisit NativeWind + React Query + Jest

### Brique 2 — UI Kit production : `chvvkrishnakumar/expo-nativewind-template`
- 20+ composants pré-construits : Buttons, Cards, Dialogs, Bottom Sheets, Forms, Badge, Tab Navigation, Hamburger Menu
- NativeWind, comportements iOS/Android automatiques (ex: animations Dialog différentes par OS), dark mode
- TypeScript first, accessibility WCAG
- Actif : upgrade SDK 54 il y a 3 mois, 36 stars ✅
- **Usage** : copier les composants `components/ui/` vers notre projet, adapter au design B2B. On ne prend PAS la navigation (on utilise celle du boilerplate Teczer)

### Brique 3 — Référence architecture fullstack : `react-shop/react-ecommerce`
- Monorepo Turborepo : `apps/web` (Next.js), `apps/admin` (Next.js), `apps/server` (NestJS), `packages/` (partagé)
- Actif : 226 stars, 64 forks, commits il y a 3 mois ✅
- **ATTENTION** : ce repo utilise GraphQL et PandaCSS — NON réutilisables directement (on fait REST + NativeWind)
- **Usage** : s'inspirer de la structure monorepo Turborepo, l'organisation des modules NestJS, et la séparation apps/packages. On code notre backend et notre admin from scratch.

### Repos rejetés (trop vieux ou licence problématique)
- ~~`anhquan291/e-commerce-app-react-native`~~ — 4-6 ans, obsolète
- ~~`enatega/shopping-cart-ecommerce`~~ — backend sous licence payante propriétaire

### Ce qu'on code from scratch (valeur métier différenciante)
- **Moteur des feuilles de prix B2B** : règles par règle `prix * coefficient`, application par typologie + exceptions par client individuel
- **SageService** mocké (POC) puis réel (production)
- **Module Stripe** isolé (mocké phase 1, activé phase 2)
- **Workflow 3 rôles** (client pro / commercial / admin) avec leurs parcours et permissions
- **Import catalogue Excel** avec transformation → format Sage
- **Système de notifications push** administrable par client

---

## Livrables Attendus (selon CC)

1. **Prototype fonctionnel UX/UI** — maquettes validées avant développement
2. **Application mobile complète** — iOS & Android
3. **Interface d'administration web** — backoffice Next.js
4. **Connecteur Sage** — échanges commandes / factures / devis
5. **Documentation technique et utilisateur**
6. **Tests et validation fonctionnelle**

---

## Évolutions Futures Prévues (architecture à anticiper)

- Connexion automatisée FedEx (colis) + Geodis (palettes) pour suivi livraison
- Historique de commandes consolidé avec analytics
- Modules statistiques : ventes, clients actifs, top produits
- Extension version web pour les clients (pas seulement admin)
- Activation Stripe (paiement CB natif)

---

## État d'Avancement & Prochaines Étapes

### Phase actuelle : UX Design + Architecture (pré-code)
- [x] Cahier des charges analysé
- [x] Stack technique décidée
- [x] Stratégie Sage (SageService mocké) validée
- [x] Stratégie code reuse (3 briques GitHub) validée
- [x] Infrastructure OVH validée
- [ ] Parcours UX complets par rôle (wireframes)
- [ ] `PROJECT.md` — fichier de référence technique central
- [ ] `TASKS.md` — backlog kanban (Todo / In Progress / Done)
- [ ] Setup repo Git + structure Expo (boilerplate Teczer)
- [ ] Développement features (Claude Code prend le relai)

### Workflow Claude.ai ↔ GitHub Copilot VS Code
- **Ici (Copilot VS Code)** : implémentation code, debug, refactoring, questions techniques sur le codebase
- **Claude.ai web** : réflexion UX/architecture, génération de specs, décisions de design, livrables PDF/Word
- **Fichiers pont** : `PROJECT.md` + `TASKS.md` dans le repo — lus par Copilot, mis à jour manuellement après chaque session
