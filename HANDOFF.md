# ElecProDeals — Handoff Document
*Mise à jour le 6 juin 2026 — Sprint 0 foundations terminé — à lire par tout agent IA prenant le relai sur ce projet*

---

## 1. Contexte projet

**ElecProDeals** — Application mobile B2B de e-commerce pour professionnels de l'électricité (artisans, installateurs, grossistes). Projet livré au client final pour test/feedback. Pas grand public — B2B spécialisé.

**Stack irrévocable :**
- Mobile : React Native + Expo SDK 54 (managed), Expo Router, TypeScript strict, NativeWind, TanStack Query, MMKV, Redux Toolkit
- Backend : NestJS + TypeScript strict, PostgreSQL (OVH France), REST JSON, JWT (15min access / 7j refresh avec rotation)
- Admin : Next.js (backoffice web)
- Paiement : Stripe isolé — Phase 2 seulement (module mocké en place)

**Règles absolues :**
- `strict: true` — zéro `any`, zéro `@ts-ignore`, zéro secret hardcodé
- Tout accès Sage passe OBLIGATOIREMENT par `SageService` — jamais directement
- Tokens stockés dans MMKV (jamais AsyncStorage)
- RGPD : données sur OVH France uniquement
- OWASP Mobile Top 10 respecté

**Git :**
- Branche active : `develop` (merge `feat/backoffice → develop` effectué ✅)
- Dernier commit : `a797461` — `chore: update CLAUDE.md v3 — post-merge, structure audit, workflows`
- Stratégie : `main` (stable) → `develop` → `feat/xxx`
- `CLAUDE.md v3` en place — source de vérité absolue pour tous les agents IA ✅

**Credentials de test (seeder) :**
- `admin@demo.fr` / `password123`
- `commercial@demo.fr` / `password123`
- `client@demo.fr` / `password123`
- `gros-installateur@demo.fr` / `password123`

**Serveurs locaux :**
- Backend NestJS : `http://localhost:3000` (cmd: `cd server && npm run start:dev`)
- Admin Next.js : `http://localhost:3001` (cmd: `cd admin && npm run dev`)
- PostgreSQL Docker : container `elecprodeals-db`, user `elecpro`, pass `elecpro_dev_2026`, DB `elecprodeals`

---

## 2. Structure du projet

```
ElecProDeals/
├── app/                            # Mobile — Expo Router (file-based)
│   ├── (auth)/login.tsx            # Login avec Zod validation
│   ├── (client)/                   # 5 tabs : catalog, orders, invoices, notifications, account
│   ├── (commercial)/index.tsx      # ⚠️ STUB — à implémenter
│   └── (admin)/index.tsx           # Redirige vers backoffice web
├── components/ui/                  # Composants NativeWind génériques
├── services/                       # Appels API REST
│   ├── api.ts                      # Axios + intercepteurs JWT (refresh rotation)
│   ├── auth.service.ts
│   ├── catalog.service.ts
│   ├── orders.service.ts
│   ├── invoices.service.ts
│   └── notifications.service.ts
├── stores/                         # Redux Toolkit
│   ├── auth.slice.ts
│   ├── cart.slice.ts
│   └── ui.slice.ts
├── types/                          # Interfaces TypeScript partagées
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── invoice.types.ts
│   └── pricing.types.ts
├── hooks/
│   ├── useAuthGuard.ts             # Redirect par rôle
│   └── useAppStore.ts
├── lib/mmkvStorage.ts              # MMKV API (in-memory Expo Go → réel EAS)
├── server/src/                     # NestJS Backend
│   ├── app.module.ts               # 10 modules enregistrés
│   ├── main.ts                     # ValidationPipe global, CORS, seed
│   ├── auth/                       # JWT login/refresh/me
│   ├── users/                      # CRUD + RGPD (delete + export)
│   ├── catalog/                    # Produits + pricing à la volée
│   ├── orders/                     # Commandes (create, list, cancel, status)
│   ├── pricing/                    # Moteur feuilles de prix B2B ← cœur métier
│   ├── invoices/                   # Délègue à SageService (mock)
│   ├── notifications/              # Envoi + historique (BDD)
│   ├── sage/                       # SageService — abstraction Sage (POC = mock)
│   ├── stripe/                     # Module isolé — mock Phase 1
│   ├── common/guards/              # JwtAuthGuard, RolesGuard
│   └── database/                   # TypeORM entities + seed
└── admin/app/                      # Next.js Backoffice
    ├── login/page.tsx
    └── (admin)/                    # 7 pages : dashboard, clients, catalog, pricing,
                                    #           orders, invoices, notifications
```

---

## 3. État d'avancement — Ce qui est FAIT

### Backend NestJS ✅ Complet

| Module | Endpoints | Notes |
|--------|-----------|-------|
| **Auth** | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` | bcrypt, JWT rotation, DTOs validés |
| **Users** | `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`, `GET /users/:id/export` | RGPD complet |
| **Catalog** | `GET /catalog`, `GET /catalog/:id`, `GET /catalog/search?q=` | Prix B2B calculés à la volée |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel` | Numéro EPD-DATE-XXXX |
| **Pricing** | CRUD feuilles de prix + règles, `computePrice()` | Moteur multiply/add, seed 3 typologies |
| **Invoices** | `GET /invoices`, `GET /invoices/quotes` | Mock Sage (3 factures, 2 devis par client) |
| **Notifications** | `POST /notifications`, `GET /notifications` | Broadcast ou ciblé par clientId |
| **Stripe** | Module isolé mocké | `STRIPE_ENABLED=true` pour Phase 2 |
| **RGPD** | `DELETE /users/:id` (cascade), `GET /users/:id/export` | Hard delete complet |

### Mobile React Native ✅ Complet (sauf commercial)

| Écran | Route | État |
|-------|-------|------|
| Login | `/(auth)/login` | Zod validation, redirect par rôle |
| Catalogue | `/(client)/catalog` | Liste, recherche, badge stock, prix B2B, panier |
| Commandes + Panier | `/(client)/orders` | Redux cart + React Query historique |
| Factures & Devis | `/(client)/invoices` | Tabs, badges statuts, dates fr-FR |
| Notifications | `/(client)/notifications` | Liste depuis BDD, état vide |
| Compte | `/(client)/account` | Profil, déconnexion |
| Commercial | `/(commercial)` | ⚠️ STUB — UI de placeholder uniquement |

### Backoffice Admin Next.js ✅ Complet

Toutes les pages fonctionnelles et branchées API :
- **Dashboard** — stats statiques (chiffres non branchés BDD)
- **Clients** — liste, activation, assignation feuille de prix
- **Catalogue** — liste produits
- **Pricing** — CRUD feuilles de prix et règles
- **Commandes** — liste avec filtres statut
- **Factures** — factures + devis (mock Sage)
- **Notifications** — formulaire envoi ciblé/broadcast + historique

---

## 4. Ce qui RESTE à faire — Priorité démo client

### 🔴 Bloquant (sans ça la démo est incomplète)

#### A. Rôle commercial — écrans mobile
**Fichier à créer :** `app/(commercial)/` — parcours complet
**Parcours CDC :** liste de ses clients (`assignedCommercialId`) → sélectionner un client → catalogue avec ses prix → passer commande au nom du client

**Backend manquant :**
```
GET /users/my-clients    → retourne les clients où assignedCommercialId = user.sub
POST /orders/for-client  → createOrder avec clientId passé en body (commercial uniquement)
```

**Screens à créer :**
1. `app/(commercial)/clients/index.tsx` — liste clients du portefeuille
2. `app/(commercial)/catalog/index.tsx` — catalogue avec context client sélectionné
3. `app/(commercial)/order/confirm.tsx` — confirmation commande

#### B. `PATCH /orders/:id/status` — backend
**Pourquoi :** L'admin doit pouvoir faire avancer une commande (`pending → confirmed → shipped → delivered`) pour la démo. Actuellement impossible côté backoffice.
**Fichier :** `server/src/orders/orders.controller.ts` + `orders.service.ts`

---

### 🟠 Important (améliore la démo)

#### C. Dashboard stats branchées BDD
Les 4 stats du dashboard affichent "—". Brancher sur :
- `GET /orders?status=pending` → count
- `GET /users?role=client&isActive=true` → count

#### D. Tests manquants
CDC exige couverture sur : DTOs NestJS, guards d'autorisation, SageService mocks.
Seul `pricing.service.spec.ts` existe actuellement.

---

### 🟡 Production (pas urgent pour démo)

| Point | Action requise |
|-------|---------------|
| Admin localStorage → httpOnly cookies | Migrer `admin_token` de `localStorage` vers cookies `httpOnly` via route API Next.js `/api/auth/session` |
| Rate limiting | `@nestjs/throttler` sur `POST /auth/login` (brute force) |
| Helmet | `helmet()` dans `server/src/main.ts` |
| SSL pinning mobile | `react-native-ssl-public-key-pinning` sur builds EAS |
| Import catalogue Excel | Upload + parsing Excel → `ProductEntity` |
| Promotions temporaires | Campagnes promo (CDC 3.1 + 3.5) |
| PDF factures | Génération/download PDF (CDC 3.4) |

---

## 5. Moteur de prix B2B — fonctionnement

C'est le cœur métier différenciant. Comprendre avant de toucher au pricing :

```
Priorité de résolution :
1. pricingSheetId du client (feuille individuelle)
   └─ Si absent ou inactif →
2. feuille par customerType (artisan | large_installer | wholesaler)
   └─ Si absent →
3. prix public (publicPrice)

Une feuille = N règles appliquées en cascade par sortOrder
Opérateurs : multiply (prix * value) | add (prix + value)
Exemple : règle multiply 0.85 = remise 15%
```

**3 feuilles seedées :**
- `sheet-artisan-standard` — `multiply 0.90` (10% de remise)
- `sheet-gros-installateur` — `multiply 0.82` (18% de remise)
- `sheet-grossiste` — `multiply 0.75` (25% de remise)

---

## 6. SageService — stratégie mock → réel

**Règle absolue :** aucun code n'importe ni n'appelle Sage directement. Tout passe par `SageService`.

**État actuel (POC) :**
- Catalogue produits → PostgreSQL (réel, pas mock)
- Factures, devis → mock (données JSON statiques)
- Commandes → BDD locale (sageOrderRef = null)

**Pour activer Sage en production :**
1. Récupérer l'identifiant API auprès du client
2. Remplacer l'implémentation interne de `server/src/sage/sage.service.ts`
3. Aucun autre fichier ne change — interfaces TypeScript identiques

---

## 7. Architecture authentification mobile

```typescript
// Flux login
authService.login() → JWT access + refresh
  → encryptedStorage.set() (MMKV API)
  → dispatch(setCredentials()) → Redux

// Intercepteur Axios (services/api.ts)
// Toute requête → attach Bearer token
// 401 reçu → tentative refresh automatique
// Si refresh échoue → logout + redirect login

// Protection des routes
useAuthGuard('client')   // dans app/(client)/_layout.tsx
useAuthGuard('commercial') // dans app/(commercial)/_layout.tsx
// Redirect automatique selon rôle si mauvais groupe
```

---

## 8. Variables d'environnement

**`server/.env` (non commité) :**
```env
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=elecpro
DATABASE_PASSWORD=elecpro_dev_2026
DATABASE_NAME=elecprodeals
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
JWT_ACCESS_EXPIRES_IN_SECONDS=900
JWT_REFRESH_EXPIRES_IN_SECONDS=604800
STRIPE_ENABLED=false
```

**Mobile `.env` :**
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.148:3000
```

---

## 9. Commandes utiles

```powershell
# Démarrer backend
cd server ; npm run start:dev

# Démarrer admin
cd admin ; npm run dev

# Docker PostgreSQL
docker start elecprodeals-db

# TypeScript check (0 erreur attendu)
cd server ; npx tsc --noEmit
cd .. ; npx tsc --noEmit
cd admin ; npx tsc --noEmit

# Tests
cd server ; npm run test

# Re-seed (si BDD vide)
cd server ; npx ts-node src/database/seed.ts
```

---

## 10. Sprint 0 — Foundations (TERMINÉ ✅)

| Étape | Commit | Statut |
|-------|--------|---------|
| Merge `feat/backoffice → develop` (83 fichiers, 10 modules NestJS, 7 pages admin) | `814d0de` | ✅ |
| CLAUDE.md v3 — constitution projet à jour | `a797461` | ✅ |
| `react-native-mmkv` v4.3.1 + `nitro-modules` 0.35.9 | `a4f87a0` | ✅ |
| `react-test-renderer` 19.1.0 aligné React 19 | `ace061b` | ✅ |
| Suppression `passport-local` (unused) | `fdce6a6` | ✅ |
| TypeScript 0 erreur — mobile + backend + admin | — | ✅ |

---

## 11. Prochaine session — ordre recommandé

### 🔴 Sprint 1 — CI/CD (priorité immédiate)

1. **CI/CD GitHub Actions** — pipeline `develop` → lint + tsc + tests
   - Fichier : `.github/workflows/ci.yml`
   - Jobs : `tsc --noEmit` sur les 3 couches, `npm run test` backend
   - Déclencheur : push sur `develop` et `feat/*`

2. **`PATCH /orders/:id/status`** — backend bloquant démo
   - `server/src/orders/orders.controller.ts` + `orders.service.ts`
   - Guard : `ADMIN` et `COMMERCIAL` uniquement
   - Statuts : `pending → confirmed → shipped → delivered`

3. **Sécurité admin localStorage → httpOnly cookie**
   - Route Next.js `/api/auth/session`
   - Remplacer `localStorage.setItem('admin_token', ...)` partout dans `admin/`

### 🟠 Sprint 1 — suite

4. `@nestjs/throttler` sur `POST /auth/login` (max 5 req/min)
5. `helmet()` dans `server/src/main.ts`
6. Dashboard stats branchées BDD (remplacer les 4 valeurs statiques)
7. Créer `users.controller.ts` (extraire routes de `users.service.ts`)

### 🟡 Phase 3 — après feedback client

8. **`feat/commercial`** — nouvelle branche, 3 écrans mobile
9. Backend : `GET /users/my-clients` + `POST /orders/for-client`
10. Tests DTOs + guards (pricing, SageService, roles.guard)
11. Merge `develop → main` avant démo client

---

*Dernière mise à jour : 6 juin 2026 — Sprint 0 foundations complet*
*Référence CDC : `docs/CDC_Elec_Pro_Deals-v2.pdf`*
*Source de vérité : `CLAUDE.md` v3 (remplace PROJECT.md désynchronisé)*
