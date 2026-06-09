# ElecProDeals — Handoff Document
*Mise à jour le 9 juin 2026 — Sprint 1 terminé — PR #1 ouvert vers develop*
*À lire par tout agent IA prenant le relai sur ce projet*

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
- Tokens mobiles stockés dans MMKV (jamais AsyncStorage)
- Token admin stocké en cookie `httpOnly` via `/api/auth/session` (jamais localStorage)
- RGPD : données sur OVH France uniquement

**Git :**
- Branche active : `feat/sprint1-client`
- PR #1 ouvert : `feat/sprint1-client → develop` — CI ✅ 3 jobs passed
- Dernier commit : `e7ba8c7` — `docs(admin): add TODO on revenueThisMonth business logic`
- Stratégie : `main` (stable) → `develop` → `feat/xxx`

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
│   ├── (commercial)/index.tsx      # ⚠️ STUB — à implémenter Phase 3
│   └── (admin)/index.tsx           # Redirige vers backoffice web
├── components/ui/                  # 25 composants NativeWind génériques
├── server/src/                     # NestJS Backend
│   ├── app.module.ts               # 11 modules (incl. AdminModule)
│   ├── main.ts                     # helmet() + ValidationPipe + CORS + seed
│   ├── auth/                       # JWT login/refresh/me + ThrottlerGuard (5/min)
│   ├── users/                      # CRUD + RGPD + dto/update-user.dto.ts
│   ├── catalog/                    # Produits + pricing à la volée
│   ├── orders/                     # PATCH :id/status avec transitions validées
│   ├── pricing/                    # Moteur feuilles de prix B2B ← cœur métier
│   ├── invoices/                   # Délègue à SageService (mock)
│   ├── notifications/              # Envoi + historique (BDD)
│   ├── admin/                      # GET /admin/stats — dashboard stats réelles
│   ├── sage/                       # SageService — abstraction Sage (POC = mock)
│   ├── stripe/                     # Module isolé — mock Phase 1
│   ├── common/guards/              # JwtAuthGuard, RolesGuard
│   └── database/                   # TypeORM entities + seed
└── admin/app/                      # Next.js Backoffice
    ├── api/auth/session/route.ts   # Cookie httpOnly — POST/GET/DELETE
    ├── hooks/useAdminToken.ts      # Hook partagé — lit le cookie session
    ├── login/page.tsx              # POST vers /api/auth/session
    ├── components/Sidebar.tsx      # DELETE vers /api/auth/session au logout
    └── (admin)/                    # 7 pages — toutes branchées API réelle
        ├── dashboard/              # Stats réelles via GET /admin/stats
        ├── clients/
        ├── catalog/
        ├── pricing/
        ├── orders/                 # Boutons statut alignés machine d'état backend
        ├── invoices/
        └── notifications/
```

---

## 3. État d'avancement — Ce qui est FAIT

### Backend NestJS ✅ Complet

| Module | Endpoints | Notes |
|--------|-----------|-------|
| **Auth** | `POST /auth/login` (throttled 5/min), `POST /auth/refresh`, `GET /auth/me` | bcrypt, JWT rotation, helmet |
| **Users** | `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`, `GET /users/:id/export` | RGPD complet, UpdateUserDto extrait |
| **Catalog** | `GET /catalog`, `GET /catalog/:id`, `GET /catalog/search?q=` | Prix B2B calculés à la volée |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel`, `PATCH /orders/:id/status` | Transitions strictes + guard roles |
| **Pricing** | CRUD feuilles de prix + règles, `computePrice()` | Moteur multiply/add, seed 3 typologies |
| **Invoices** | `GET /invoices`, `GET /invoices/quotes` | Mock Sage (3 factures, 2 devis par client) |
| **Notifications** | `POST /notifications`, `GET /notifications` | Broadcast ou ciblé par clientId |
| **Admin** | `GET /admin/stats` | ordersToday, revenueThisMonth¹, activeClients, pendingOrders |
| **Stripe** | Module isolé mocké | `STRIPE_ENABLED=true` pour Phase 2 |

> ¹ **TODO** dans `admin.service.ts` — CA calculé sur toutes commandes sauf cancelled (Option A). Option B = delivered uniquement. Décision client attendue.

### Mobile React Native ✅ Complet (sauf commercial)

| Écran | Route | État |
|-------|-------|------|
| Login | `/(auth)/login` | Zod validation, redirect par rôle |
| Catalogue | `/(client)/catalog` | Liste, recherche, badge stock, prix B2B, panier |
| Commandes + Panier | `/(client)/orders` | Redux cart + React Query historique |
| Factures & Devis | `/(client)/invoices` | Tabs, badges statuts, dates fr-FR |
| Notifications | `/(client)/notifications` | Liste depuis BDD, état vide |
| Compte | `/(client)/account` | Profil, déconnexion |
| Commercial | `/(commercial)` | ⚠️ STUB — Phase 3 |

### Backoffice Admin Next.js ✅ Complet + Sécurisé

| Page | État | Notes |
|------|------|-------|
| Login | ✅ | POST → `/api/auth/session` (httpOnly cookie) |
| Dashboard | ✅ | Stats réelles depuis `GET /admin/stats` |
| Clients | ✅ | Liste, activation, assignation feuille de prix |
| Catalogue | ✅ | Liste produits |
| Pricing | ✅ | CRUD feuilles de prix et règles |
| Commandes | ✅ | Boutons statut alignés machine d'état backend |
| Factures | ✅ | Factures + devis (mock Sage) |
| Notifications | ✅ | Formulaire envoi ciblé/broadcast + historique |

### Tests ✅ 50 tests, 7 suites, 0 échec

| Fichier | Couverture |
|---------|-----------|
| `roles.guard.spec.ts` | allow/block par rôle, cas no-user |
| `orders.service.spec.ts` | create, cancel, updateStatus — transitions valides et invalides |
| `auth.dto.spec.ts` | LoginDto — email format, password length, champs manquants |
| `sage.service.spec.ts` | mock invoices/quotes conformes aux interfaces TypeScript |
| `users.controller.spec.ts` | findAll, update, delete, exportData access control |

---

## 4. Ce qui RESTE à faire

### ⚠️ Avant merge PR #1 → develop

| Point | Action |
|-------|--------|
| httpOnly cookie — validation DevTools | DevTools → Application → Cookies → colonne HttpOnly ✅ + `document.cookie` console ne doit pas voir le token |
| CA du mois — décision client | TODO dans `admin.service.ts` — Option A (actuel) ou Option B (delivered uniquement) |

### 🟡 Sprint 1 cosmétique (non bloquant)

| # | Tâche | Couche |
|---|-------|--------|
| 8 | Unifier `utils/colors.ts` / `constants/Colors.ts` → garder `constants/Colors.ts` | Mobile |
| 9 | Supprimer `PROJECT.md` désynchronisé | Racine |

### 🟡 Test manquant

| Fichier | Priorité |
|---------|---------|
| `pricing.service.spec.ts` | Compléter avec cascade + exceptions individuelles + cas limites |

### 🟡 Sprint 2 — Distribution client (après merge develop)

1. EAS Build — profil preview (QR code client)
2. Hébergement backend temporaire (Railway / Render)
3. Variables d'environnement production (JWT secrets forts)
4. Merge `develop → main`
5. Démo client + recueil feedback

---

## 5. Moteur de prix B2B — fonctionnement

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
- Catalogue produits → PostgreSQL (réel)
- Factures, devis → mock JSON statique
- Commandes → BDD locale (sageOrderRef = null)

**Pour activer Sage en production :** remplacer uniquement l'implémentation interne de `server/src/sage/sage.service.ts`. Aucun autre fichier ne change.

---

## 7. Sécurité admin — httpOnly cookie

```
POST /api/auth/session  → stocke token en cookie httpOnly (login)
GET  /api/auth/session  → retourne { token } depuis cookie (auth check)
DELETE /api/auth/session → efface le cookie (logout)

Cookie : admin_session, httpOnly: true, sameSite: strict
httpOnly: true → inaccessible depuis document.cookie → protège contre XSS
```

Hook `useAdminToken()` — utilisé dans toutes les 6 pages admin. Pattern :
```typescript
const { token } = useAdminToken(); // premier hook
useEffect(() => {
  if (!token) return; // guard dans le body de l'effet
  apiFetch('/endpoint', token).then(...)
}, [token]);
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
SAGE_MOCK_MODE=true
```

**Mobile `.env` :**
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.148:3000
```

---

## 9. Commandes utiles

```bash
# Démarrer backend
cd server && npm run start:dev

# Démarrer admin
cd admin && npm run dev

# Docker PostgreSQL
docker start elecprodeals-db

# TypeScript check (0 erreur attendu sur les 3 couches)
cd server && npx tsc --noEmit
cd admin && npx tsc --noEmit
npx tsc --noEmit  # mobile

# Tests
cd server && npm run test   # 50 tests, 7 suites

# Re-seed (si BDD vide)
cd server && npx ts-node src/database/seed.ts
```

---

## 10. Historique des sprints

### Sprint 0 — Fondations ✅ (juin 2026)
Merge feat/backoffice, CLAUDE.md v3, fix dépendances, CI/CD vert sur 3 couches.

### Sprint 1 — Finitions client pro ✅ (9 juin 2026)
Sécurité complète (httpOnly cookie, rate limiting, helmet), dashboard stats réelles, machine d'état commandes, 50 tests. PR #1 ouvert → develop, CI vert.

---

*Dernière mise à jour : 9 juin 2026 — Sprint 1 complet, PR #1 en attente merge*
*Référence CDC : `docs/CDC_Elec_Pro_Deals-v2.pdf` (indexé NotebookLM — notebook_id: af86efc2-aace-4555-b6e4-09df86482ebd)*
*Source de vérité : `CLAUDE.md` v3*
