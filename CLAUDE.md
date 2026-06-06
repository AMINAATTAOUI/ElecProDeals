# CLAUDE.md — ElecProDeals
> Lu automatiquement à chaque session Claude Code.
> Source de vérité absolue — toute décision d'architecture passe par Claude.ai Project "ElecProDeals".
> Version : 2.0 — mise à jour post-handoff 6 juin 2026

---

## 1. Ton rôle dans ce projet

Tu es **Lead Developer iOS/Android** sur ElecProDeals.
- Tu appliques les conventions production et RGPD **sur chaque ligne de code**, pas après.
- Tu codes en **TypeScript strict** partout. Zéro `any`, zéro `@ts-ignore`, zéro secret hardcodé.
- Tu ne changes jamais une dépendance, une lib, ou un pattern architectural sans que ce soit listé ici ou demandé explicitement.
- Si une information manque pour implémenter correctement → tu la demandes avant de coder.
- Tu ne proposes jamais `moment.js`, `lodash`, `formik`, `@react-native-firebase/*`, `react-native-paper` — ces packages sont bannis de ce projet.

---

## 2. Projet — vue d'ensemble

**Nom :** ElecProDeals
**Type :** Application mobile B2B e-commerce
**Utilisateurs cibles :** Artisans, installateurs, grossistes (clients professionnels)
**Cahier des charges complet :** `docs/CDC_Elec_Pro_Deals-v2.pdf`

### Objectifs métier
- Permettre aux clients pro de commander en autonomie (sans appeler le commercial)
- Synchronisation bidirectionnelle avec Sage 100 cloud (commandes, devis, factures)
- Vente terrain : les commerciaux commandent pour le compte de leurs clients via l'app

### 3 rôles utilisateur
```typescript
enum UserRole {
  CLIENT_PRO  = 'CLIENT_PRO',   // Artisan / Installateur / Grossiste
  COMMERCIAL  = 'COMMERCIAL',   // Commercial terrain
  ADMIN       = 'ADMIN',        // Administrateur backoffice
}

enum CustomerTypology {
  ARTISAN          = 'ARTISAN',
  LARGE_INSTALLER  = 'LARGE_INSTALLER',
  WHOLESALER       = 'WHOLESALER',
}
```

---

## 3. Stack technique — IMMUABLE

Ne jamais proposer de changer ces choix sans validation sur Claude.ai.

| Couche | Technologie | Version |
|--------|-------------|---------|
| Mobile | React Native + Expo SDK managed | 54.0.31 |
| Router | Expo Router (file-based) | 6.0.14 |
| Styling mobile | NativeWind (TailwindCSS v3) | 4.1.23 |
| State global | Redux Toolkit | ^2.11.2 |
| Server state | TanStack Query (React Query) | 5.90.7 |
| Storage local | react-native-mmkv | v4.x (voir §8) |
| Réseau | Axios | ^1.15.2 |
| Validation mobile | Zod v4 | ^4.3.6 |
| Animations | react-native-reanimated | 4.1.1 |
| Backend | NestJS + TypeScript strict | ^11.0.1 |
| ORM | TypeORM | ^0.3.28 |
| Base de données | PostgreSQL (OVH France) | — |
| Auth | JWT 15min / Refresh 7j (rotation) | — |
| Paiement | Stripe — Phase 2 uniquement | désactivé |
| Notifications | expo-notifications (FCM/APNs) | ^55.0.20 |
| Backoffice | Next.js App Router | 16.2.4 |
| Styling admin | TailwindCSS v4 | ^4 |
| Hébergement | OVH VPS France (RGPD) | — |

### ⚠️ Tailwind — coexistence de versions
- **Mobile** : TailwindCSS **v3** via NativeWind → config `tailwind.config.js`
- **Admin** : TailwindCSS **v4** → config via `@import "tailwindcss"` dans `globals.css`
- Ne jamais copier-coller de configuration Tailwind entre les deux couches.

---

## 4. État d'avancement — ce qui est FAIT

### Backend NestJS ✅ Complet
Tous les modules sont implémentés et fonctionnels :
`auth` · `users` · `catalog` · `orders` · `pricing` · `invoices` · `notifications` · `sage` · `stripe` (mocké) · `admin`

Endpoints disponibles — voir `docs/API.md` pour le détail complet.

### Mobile React Native ✅ Complet (sauf rôle commercial)
| Route | État |
|-------|------|
| `/(auth)/login` | ✅ Zod validation, redirect par rôle |
| `/(client)/catalog` | ✅ Liste, recherche, prix B2B, panier |
| `/(client)/orders` | ✅ Redux cart + React Query historique |
| `/(client)/invoices` | ✅ Devis & factures mock Sage |
| `/(client)/notifications` | ✅ Liste depuis BDD |
| `/(client)/account` | ✅ Profil, déconnexion |
| `/(commercial)` | ⚠️ **STUB — à implémenter** |

### Backoffice Next.js ✅ Complet
7 pages fonctionnelles : `dashboard` · `clients` · `catalog` · `pricing` · `orders` · `invoices` · `notifications`

**⚠️ Point de sécurité ouvert :** le token admin est stocké en `localStorage` → doit migrer vers `httpOnly` cookie via `/api/auth/session` (Next.js route API). À faire avant livraison prod.

---

## 5. Ce qui RESTE à implémenter

### 🔴 Bloquant démo client

#### A. Rôle commercial — mobile
**Branche à créer :** `feat/commercial`

Backend à ajouter dans `server/src/` :
```
GET  /users/my-clients      → clients où assignedCommercialId = user.sub
POST /orders/for-client     → createOrder avec clientId en body (COMMERCIAL uniquement)
```

Écrans à créer dans `app/(commercial)/` :
1. `clients/index.tsx` — liste des clients du portefeuille
2. `catalog/index.tsx` — catalogue avec contexte client sélectionné (prix du client)
3. `order/confirm.tsx` — confirmation commande au nom du client

#### B. PATCH /orders/:id/status
Fichiers : `server/src/orders/orders.controller.ts` + `orders.service.ts`
Statuts : `pending → confirmed → shipped → delivered`
Guard : `ADMIN` et `COMMERCIAL` uniquement

### 🟠 Important avant démo

#### C. Dashboard stats branchées BDD
Remplacer les valeurs statiques par :
- `GET /orders?status=pending` → count commandes en attente
- `GET /users?role=CLIENT_PRO&isActive=true` → count clients actifs

#### D. Tests manquants
Cibles prioritaires : DTOs NestJS · guards d'autorisation · SageService mock
Seul `pricing.service.spec.ts` existe actuellement.

### 🟡 Prod (pas urgent pour démo)
- Auth admin : `localStorage` → `httpOnly` cookie
- Rate limiting : `@nestjs/throttler` sur `POST /auth/login`
- Headers sécurité : `helmet()` dans `server/src/main.ts`
- Import catalogue Excel : upload + parsing → `ProductEntity`
- Promotions temporaires (CDC §3.1 + §3.5)
- PDF factures (CDC §3.4)

---

## 6. Architecture des dossiers

```
ElecProDeals/
├── CLAUDE.md                          ← CE FICHIER
├── TASKS.md                           ← Kanban du projet
├── docs/
│   ├── CDC_Elec_Pro_Deals-v2.pdf      ← Cahier des charges
│   ├── API.md                         ← Documentation endpoints
│   ├── pricing-engine.md              ← Logique feuilles de prix
│   └── sage-connector.md              ← Stratégie mock → réel
│
├── app/                               ← Mobile Expo Router
│   ├── (auth)/
│   │   └── login.tsx                  ✅ Zod, redirect par rôle
│   ├── (client)/                      ✅ 5 tabs fonctionnels
│   ├── (commercial)/                  ⚠️ STUB — branche feat/commercial
│   └── (admin)/                       → Redirige vers backoffice web
│
├── components/ui/                     ← Composants NativeWind génériques
├── services/                          ← Axios + intercepteurs JWT
│   ├── api.ts                         ← Client HTTP central
│   ├── auth.service.ts
│   ├── catalog.service.ts
│   ├── orders.service.ts
│   ├── invoices.service.ts
│   └── notifications.service.ts
│
├── stores/                            ← Redux Toolkit slices
│   ├── auth.slice.ts
│   ├── cart.slice.ts
│   └── ui.slice.ts
│
├── types/                             ← Interfaces TypeScript partagées
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── invoice.types.ts
│   └── pricing.types.ts
│
├── hooks/
│   ├── useAuthGuard.ts                ← Redirect par rôle
│   └── useAppStore.ts
│
├── lib/
│   └── mmkvStorage.ts                 ← MMKV API (voir §8 — version à aligner)
│
├── server/src/                        ← NestJS Backend
│   ├── modules/
│   │   ├── auth/                      ✅ JWT login/refresh/me
│   │   ├── users/                     ✅ CRUD + RGPD
│   │   ├── catalog/                   ✅ Produits + pricing à la volée
│   │   ├── orders/                    ✅ + PATCH status à ajouter
│   │   ├── pricing/                   ✅ Moteur feuilles de prix B2B
│   │   ├── invoices/                  ✅ Délègue à SageService
│   │   ├── notifications/             ✅ Broadcast + ciblé
│   │   ├── sage/                      ✅ Mock complet — @docs/sage-connector.md
│   │   └── stripe/                    ✅ Module isolé mocké Phase 2
│   ├── common/
│   │   ├── guards/                    ← JwtAuthGuard, RolesGuard
│   │   └── decorators/                ← @Roles(), @CurrentUser()
│   └── database/
│       ├── migrations/                ← NE PAS utiliser synchronize:true en prod
│       └── seed.ts                    ← Credentials de test seedés
│
└── admin/app/                         ← Next.js Backoffice
    ├── login/
    └── (admin)/                       ✅ 7 pages fonctionnelles
```

---

## 7. Moteur de prix B2B — règles absolues

C'est le cœur métier différenciant. **Ne jamais modifier sans lire `docs/pricing-engine.md` d'abord.**

```
Priorité de résolution du prix :
1. pricingSheetId individuel du client  (exception individuelle)
   └─ Si absent →
2. Feuille par customerTypology          (règle de groupe)
   └─ Si absent →
3. publicPrice                           (prix catalogue)

Une feuille = N règles appliquées en CASCADE par sortOrder
Opérateurs : multiply (prix * value) | add (prix + value)
```

**3 feuilles seedées en BDD :**
```
sheet-artisan-standard     → multiply 0.90  (−10%)
sheet-gros-installateur    → multiply 0.82  (−18%)
sheet-grossiste            → multiply 0.75  (−25%)
```

---

## 8. SageService — règle absolue

**Aucun code ne doit appeler Sage directement.** Tout passe par `SageService`.

```typescript
// server/src/modules/sage/sage.service.ts
// Pattern à respecter impérativement

@Injectable()
export class SageService {
  private get isMock(): boolean {
    return this.config.get('SAGE_MOCK_MODE') === 'true';
  }
  // Catalogue → PostgreSQL réel (pas mock)
  // Factures, devis → mock JSON statique
  // Commandes → BDD locale (sageOrderRef = null)
}
```

**Pour activer Sage réel :** remplacer uniquement l'implémentation interne — aucune autre fichier ne change.

---

## 9. Authentification mobile — flux complet

```typescript
// Login
authService.login() → JWT access (15min) + refresh (7j)
  → MMKV.set('access_token', ...)   // Jamais AsyncStorage
  → MMKV.set('refresh_token', ...)
  → dispatch(setCredentials())       // Redux

// Intercepteur Axios (services/api.ts)
// 401 reçu → tentative refresh automatique
// Refresh échoue → logout + redirect /(auth)/login

// Protection des routes
useAuthGuard('CLIENT_PRO')   // app/(client)/_layout.tsx
useAuthGuard('COMMERCIAL')   // app/(commercial)/_layout.tsx
useAuthGuard('ADMIN')        // redirige vers backoffice web
```

---

## 10. RGPD — règles de code non négociables

```typescript
// ❌ JAMAIS logger des données personnelles
logger.log(`User ${user.email} logged in`);   // INTERDIT
logger.log(`Order ${orderId} by ${user.id}`); // OK — ID anonyme seulement

// ✅ Soft delete obligatoire (droit à l'effacement)
@DeleteDateColumn()
deletedAt: Date;  // Jamais DELETE FROM — toujours soft delete

// ✅ JWT payload minimal — jamais d'email/nom dans le token
interface JwtPayload {
  sub: string;      // userId uniquement
  role: UserRole;
  iat: number;
  exp: number;
}

// ✅ Données hébergées OVH France uniquement
// ✅ Export RGPD disponible : GET /users/:id/export
```

---

## 11. Conventions de code — non négociables

### TypeScript strict
```typescript
// ✅ Toujours
interface CreateOrderDto { ... }
const result: OrderResponse = ...

// ❌ Jamais
const data: any = ...
// @ts-ignore
const x = {} as unknown as MyType  // double cast interdit
```

### Nommage
```
PascalCase      → Composants React, Interfaces, Types, Enums, Classes
camelCase       → Variables, fonctions, hooks (useXxx), méthodes
SCREAMING_CASE  → Constantes, enums values, variables d'env
kebab-case      → Fichiers, dossiers, routes URL
```

### Commits (format obligatoire)
```
feat(commercial): add client list screen
fix(orders): apply correct price sheet on B2B checkout
chore(deps): align mmkv to v4 with nitro-modules 0.35
refactor(auth): extract token refresh to dedicated hook
test(pricing): add unit tests for cascade rule engine
```

### Git
```
main      ← stable, livrable client
develop   ← intégration
feat/xxx  ← features (ex: feat/commercial, feat/order-status)
fix/xxx   ← corrections ciblées
```

---

## 12. Variables d'environnement

### `server/.env` (non commité — ne jamais commiter)
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

### Mobile `.env`
```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.148:3000
```

---

## 13. Commandes utiles

```powershell
# Backend
cd server && npm run start:dev

# Admin
cd admin && npm run dev

# PostgreSQL Docker
docker start elecprodeals-db

# Re-seed BDD
cd server && npx ts-node src/database/seed.ts

# TypeScript check (0 erreur attendu sur les 3 couches)
cd server && npx tsc --noEmit
cd .. && npx tsc --noEmit
cd admin && npx tsc --noEmit

# Tests
cd server && npm run test
```

### Credentials de test (seedés en BDD)
```
admin@demo.fr              / password123
commercial@demo.fr         / password123
client@demo.fr             / password123
gros-installateur@demo.fr  / password123
```

---

## 14. Packages INTERDITS dans ce projet

Ne jamais installer, ne jamais proposer :

| Package | Raison |
|---------|--------|
| `moment.js` | Abandonné, 66KB — utiliser `date-fns` ou `Intl` natif |
| `lodash` | 70KB — utiliser ES2022 natif |
| `react-native-paper` | Redondant avec NativeWind déjà en place |
| `@react-native-firebase/*` | Conflit avec expo-notifications déjà configuré |
| `formik` | Redondant — Zod v4 + react-hook-form si besoin |
| Toute lib > 18 mois sans commit | Risque CVE, incompatibilité New Architecture |

---

## 15. Packages prévus Phase 2 — ne pas installer avant signal

| Package | Déclencheur |
|---------|-------------|
| `@stripe/stripe-react-native` + `stripe` server | `STRIPE_ENABLED=true` décidé |
| `@nestjs/throttler` | Sprint sécurité avant prod OVH |
| `helmet` | Sprint sécurité avant prod OVH |
| `react-native-ssl-public-key-pinning` | Build store final |
| `expo-local-authentication` | Feature biométrie validée |

---

## 16. Hors scope — ne pas implémenter sans validation

- Connexion transporteurs FedEx / Geodis
- Historique commandes consolidé
- Module statistiques avancées
- Version web pour les clients
- Sage API réelle (accès credentials en attente)

---

## 17. Escalade

**Toute décision d'architecture** (nouvelle lib majeure, changement de pattern, modification schéma BDD, nouveau module) → remonter sur **Claude.ai Project "ElecProDeals"** avant d'implémenter.

Ne jamais prendre ces décisions seul dans une session Claude Code.
