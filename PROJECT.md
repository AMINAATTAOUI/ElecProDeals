# PROJECT.md — ElecProDeals

> **Fichier de référence technique central.**
> Lu par GitHub Copilot à chaque session de dev. Mis à jour après chaque étape majeure.
> Cahier des charges complet : `docs/CDC_Elec_Pro_Deals-v2.pdf`

---

## Vue d'ensemble

**ElecProDeals** — Application mobile B2B de e-commerce pour professionnels de l'électricité.

| Attribut | Valeur |
|---|---|
| Type | B2B, app mobile + backoffice web |
| Cible | Artisans électriciens, installateurs, grossistes |
| Plateforme mobile | iOS + Android |
| Système de gestion | Sage 100 Gestion Commerciale + Comptabilité Cloud |
| Hébergement | OVH (sol français, conformité RGPD) |
| Phase actuelle | UX Design + Architecture (pré-code) |

---

## Stack Technique

### Mobile (Application principale)

| Technologie | Rôle |
|---|---|
| React Native + Expo (managed) | Framework mobile cross-platform |
| Expo Router | Navigation file-based |
| TypeScript strict | Typage statique, zéro `any` |
| NativeWind / TailwindCSS | Styles UI |
| TanStack Query (React Query) | Fetching, cache, sync serveur |
| MMKV | Storage local chiffré |
| Redux Toolkit | State global (panier, session) |
| Expo Notifications | Push notifications |
| Expo LocalAuthentication | Biométrie Touch ID / Face ID |
| Stripe SDK (isolé, mocké) | Paiement CB — phase 2 seulement |
| Jest + RNTL | Tests unitaires |
| ESLint + Prettier | Qualité de code |

### Backend

| Technologie | Rôle |
|---|---|
| NestJS + TypeScript | Framework API REST |
| PostgreSQL | Base de données principale |
| JWT (access 15min / refresh 7j) | Authentification (OAuth2 mentionné dans le CC mais non retenu en phase 1 — à confirmer avec le client) |
| class-validator + class-transformer | Validation des DTOs |
| `SageService` (mocké → réel) | Couche d'abstraction Sage |

### Admin / Backoffice Web

| Technologie | Rôle |
|---|---|
| Next.js (React) | Dashboard d'administration |
| TypeScript strict | Partagé avec le mobile |
| TanStack Query | Fetching côté web |

### Infrastructure

| Service | Usage |
|---|---|
| OVH | Backend + PostgreSQL (France) |
| Firebase FCM | Push notifications Android |
| APNs (Apple) | Push notifications iOS |
| GitHub Actions | CI/CD (à configurer) |

---

## Sources de Code — 3 Briques GitHub

### Brique 1 : Fondation mobile — `Teczer/fast-expo-app`
- **URL** : https://github.com/Teczer/fast-expo-app
- **Status** : ✅ Actif, v3.3.0 (Jan 2025), 94 stars, 26 forks
- **Contenu** : TypeScript strict, Expo Router, MMKV, React Query (opt.), Jest (opt.), ESLint/Prettier, dark mode, New Architecture
- **Installation** : `bunx fast-expo-app@latest` → choisir NativeWind + React Query + Jest
- **Usage dans notre projet** : Base du projet mobile, on part de ce scaffold

### Brique 2 : UI Kit — `chvvkrishnakumar/expo-nativewind-template`
- **URL** : https://github.com/chvvkrishnakumar/expo-nativewind-template
- **Status** : ✅ Actif, upgrade Expo SDK 54 (3 mois), 36 stars, 6 forks
- **Contenu** : 20+ composants (Button, Card, Dialog, BottomSheet, Badge, Input, Switch, Hamburger Menu, Tab Navigation), dark mode, TypeScript, WCAG
- **⚠️ Note** : Le repo utilise Expo Router v3 dans sa navigation — on ne prend QUE `components/ui/`, pas la navigation
- **Usage dans notre projet** : Copier `components/ui/` dans notre projet, adapter au design B2B

### Brique 3 : Référence architecture — `react-shop/react-ecommerce`
- **URL** : https://github.com/react-shop/react-ecommerce
- **Status** : ✅ Actif, 226 stars, 64 forks, commits récents (3 mois)
- **Structure** : Monorepo Turborepo → `apps/web`, `apps/admin`, `apps/server` (NestJS), `packages/`
- **⚠️ Note importante** : Ce repo utilise GraphQL (pas REST) et PandaCSS (pas NativeWind) — NON réutilisables directement
- **Usage dans notre projet** : S'inspirer de la structure monorepo Turborepo, l'organisation des modules NestJS, la séparation apps/packages. Code from scratch pour tout le reste.

---

## Intégration Sage 100 Cloud

### Stratégie POC (état actuel)
L'accès à l'API Sage n'est pas encore disponible. On construit la couche `SageService` maintenant avec des données mockées.

**Règle absolue : aucun code applicatif ne touche directement Sage.**

```
App Mobile → NestJS API → SageService → [POC: Mock Data] → [Prod: Sage API REST]
```

Le switch du mock vers le réel = remplacer uniquement l'implémentation interne de `SageService`, rien d'autre.

### Données à synchroniser

| Source | Direction | Déclencheur |
|---|---|---|
| Catalogue produits | Sage → App | Import Excel ou import Sage |
| Clients | Sage ↔ App | Bidirectionnel |
| Feuilles de prix | Sage → App | À chaque modification |
| Bons de commande | App → Sage | À la validation de commande |
| Devis | Sage → App | Pull sur demande client |
| Factures | Sage → App | Pull sur demande client |

### Pour activer Sage en production
1. Récupérer l'identifiant API auprès du client
2. Vérifier les endpoints activés sur son contrat Sage Developer
3. Remplacer l'implémentation de `SageService` — interfaces TypeScript identiques

---

## Fonctionnalités Métier

### Catalogue (3.1)
- Import références depuis Excel (ou Sage si faisable)
- Fiche produit : nom, référence, description, prix public, remise, délais livraison, statut stock
- Recherche multicritère : référence, nom, catégorie
- Promotions temporaires (campagnes)

### Feuilles de Prix B2B (3.2) — Cœur métier
- Une feuille de prix = ensemble de règles tarifaires appliquées à une liste de clients ou une typologie
- Exemple de règle : `prix_initial * 1.2`
- Autant de feuilles de prix que nécessaire
- Application : à une **typologie** (1:n) OU à une **liste de clients spécifiques**
- 3 typologies : Artisans/Installateurs standards | Gros installateurs | Grossistes

### Commandes (3.3)
- Paiement comptant : CB via Stripe (phase 2)
- Paiement différé : configurable par client, géré dans Sage (hors-scope app)
- Envoi automatique bon de commande → Sage
- Suivi statut : `en cours` / `expédiée` / `livrée`

### Devis & Facturation (3.4)
- Affichage devis et factures depuis Sage
- Suivi : `devis accepté` / `en attente` / `facturé` / `payé`
- Téléchargement PDF *(non explicite dans le CC — décision d'architecture, à confirmer avec le client)*

### Notifications Push (3.5)
- Nouvelles campagnes promo, changements de statut
- Administrables depuis le backoffice, par client spécifique
- FCM (Android) + APNs (iOS)

### Backoffice Admin (3.6)
- Gestion clients + droits d'accès
- Import catalogue Excel + ajustement prix/remises
- Suivi commandes
- Gestion promotions + notifications

---

## 3 Profils Utilisateurs

| Rôle | Parcours Principal | Restrictions |
|---|---|---|
| **Client Professionnel** | Catalogue → Panier → Commande → Devis/Factures → Suivi | Ses données uniquement |
| **Commercial** | Catalogue → Commande pour compte client → Consultation clients | Clients de son portefeuille uniquement |
| **Administrateur** | Backoffice complet | Aucune |

---

## Architecture Dossiers — Expo Router

```
ElecProDeals/
├── app/                          # Routes Expo Router (file-based)
│   ├── (auth)/                   # Login, register (routes publiques)
│   ├── (client)/                 # Espace client professionnel (tabs)
│   │   ├── catalog/              # Catalogue + fiche produit
│   │   ├── orders/               # Commandes + suivi
│   │   ├── invoices/             # Devis & factures
│   │   └── account/              # Profil client
│   ├── (commercial)/             # Espace commercial
│   └── (admin)/                  # Backoffice admin
├── components/
│   ├── ui/                       # Composants génériques (depuis expo-nativewind-template)
│   ├── catalog/                  # ProductCard, SearchBar, StockBadge...
│   ├── orders/                   # OrderCard, CartItem, CheckoutForm...
│   └── shared/                   # Composants partagés multi-rôles
├── services/
│   ├── api.ts                    # Instance axios + interceptors JWT
│   ├── auth.service.ts
│   ├── catalog.service.ts
│   ├── orders.service.ts
│   ├── invoices.service.ts
│   └── sage.service.ts           # SageService (mocké POC)
├── stores/
│   ├── cart.slice.ts
│   ├── auth.slice.ts
│   └── ui.slice.ts
├── types/
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── invoice.types.ts
│   └── pricing.types.ts          # Feuilles de prix, règles tarifaires
├── hooks/
├── utils/
├── constants/
└── docs/
    └── CDC_Elec_Pro_Deals-v2.pdf
```

---

## Conventions de Code

### TypeScript
```typescript
// ✅ Correct
type OrderStatus = 'pending' | 'shipped' | 'delivered';
interface Product { id: string; name: string; price: number; }

// ❌ Interdit
const data: any = {};
// @ts-ignore
```

### Nommage
| Type | Convention | Exemple |
|---|---|---|
| Variables, fonctions | `camelCase` | `getProductById` |
| Composants, interfaces, types | `PascalCase` | `ProductCard`, `Product` |
| Constantes globales | `SCREAMING_SNAKE_CASE` | `API_BASE_URL` |
| Fichiers/dossiers | `kebab-case` | `product-card.tsx` |
| Hooks custom | Préfixe `use` | `useCart`, `usePricing` |
| Interfaces | Pas de préfixe `I` | `Product` (pas `IProduct`) |

### Commits Git Conventionnels
```
feat: add product search with category filter
fix: correct price calculation for grossiste tier
chore: update expo sdk
docs: update pricing engine documentation
test: add unit tests for SageService mocks
refactor: extract price calculation to usePricing hook
```

### Tests
- Jest + React Native Testing Library
- Couverture obligatoire : moteur feuilles de prix, calculs remises, transformations Sage, DTOs NestJS, guards auth
- Fichiers tests dans `__tests__/` à côté du fichier testé

---

## Sécurité

### Authentication
- Access token : 15 minutes (JWT)
- Refresh token : 7 jours avec rotation obligatoire
- Stockage tokens : MMKV uniquement (jamais AsyncStorage)
- Biométrie : optionnelle, via `expo-local-authentication`

### RGPD
- Toutes données personnelles → OVH France uniquement
- Consentement explicite au premier lancement
- `DELETE /users/:id` → suppression complète (droit à l'oubli)
- `GET /users/:id/export` → export JSON (droit d'accès)
- Logs : zéro PII (nom, email, téléphone, SIRET)

### Checklist sécurité (OWASP Mobile)
- [ ] Zéro secret hardcodé → `.env` pour tout
- [ ] Validation Zod (mobile) + class-validator (NestJS)
- [ ] HTTPS partout + SSL pinning en production
- [ ] Tokens stockés dans MMKV (chiffré)
- [ ] Pas de PII dans les logs
- [ ] Pas de flags debug en build production
- [ ] `npm audit` à chaque sprint

---

## État d'Avancement

### ✅ Décisions prises
- [x] Cahier des charges analysé
- [x] Stack technique décidée (React Native + Expo, NestJS, PostgreSQL, Next.js)
- [x] Stratégie Sage : `SageService` mocké → réel sans impact sur le reste
- [x] Stratégie Stripe : module isolé, mocké phase 1, activé phase 2
- [x] Hébergement : OVH (France, RGPD)
- [x] 3 briques GitHub identifiées et vérifiées
- [x] Architecture dossiers définie
- [x] `.github/copilot-instructions.md` configuré

### 🔲 Prochaines étapes
- [ ] Wireframes UX par rôle (client pro, commercial, admin) — Claude.ai web
- [ ] Setup repo Git avec boilerplate `Teczer/fast-expo-app`
- [ ] Import composants UI depuis `chvvkrishnakumar/expo-nativewind-template`
- [ ] `SageService` — interfaces TypeScript + données mockées
- [ ] Module d'authentification (JWT + refresh + biométrie)
- [ ] Catalogue produits (liste, filtres, fiche produit)
- [ ] Moteur de feuilles de prix B2B
- [ ] Panier + processus de commande
- [ ] Devis & Factures (depuis Sage mocké)
- [ ] Notifications push
- [ ] Backoffice admin (Next.js)
- [ ] Tests unitaires logique métier
- [ ] CI/CD GitHub Actions *(plus tard, quand le produit est stable)*
- [ ] Documentation utilisateur et guide d'administration *(optionnel selon CC section 6)*

---

## TASKS.md — Backlog

> Voir `TASKS.md` pour le kanban détaillé (Todo / In Progress / Done).

---

## Décisions d'Architecture Clés

| Décision | Choix | Raison |
|---|---|---|
| Framework mobile | React Native + Expo | Code sharing avec backoffice React, SDK Stripe mature, meilleur écosystème B2B |
| vs Flutter | React Native retenu | Partage de logique métier avec Next.js impossible avec Flutter |
| Styling | NativeWind | TailwindCSS = consistance web/mobile, dark mode, design system bien établi |
| State management | Redux Toolkit + React Query | RQ pour le cache serveur, Redux pour le state UI local (panier) |
| Storage | MMKV | 30x plus rapide qu'AsyncStorage, chiffrement natif |
| API | REST (pas GraphQL) | Plus simple à implémenter avec NestJS pour un premier livrable |
| Sage | `SageService` abstrait | POC sans attendre l'accès API, switch transparent quand l'accès arrive |
| Paiement | Stripe (phase 2) | RGPD-friendly, SDK mobile excellent, peut attendre phase 2 |

---

*Dernière mise à jour : Avril 2026*
*Lead Developer : GitHub Copilot (VS Code)*
