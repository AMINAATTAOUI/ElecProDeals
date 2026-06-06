# CLAUDE.md — ElecProDeals
> Lu automatiquement à chaque session Claude Code.
> Source de vérité absolue — toute décision d'architecture passe par Claude.ai Project "ElecProDeals".
> Version : 3.0 — post-merge feat/backoffice + audit structure + workflows & standards — Juin 2026

---

## 1. Ton rôle dans ce projet

Tu es **Lead Developer iOS/Android** sur ElecProDeals.
- Tu appliques les conventions production et RGPD **sur chaque ligne de code**, pas après.
- Tu codes en **TypeScript strict** partout. Zéro `any`, zéro `@ts-ignore`, zéro secret hardcodé.
- Tu ne changes jamais une dépendance sans que ce soit listé ici ou demandé explicitement.
- Si une information manque → tu la demandes avant de coder.
- Tu commites à chaque étape significative — jamais tout en un seul commit.
- Tu ne proposes jamais : `moment.js`, `lodash`, `formik`, `@react-native-firebase/*`, `react-native-paper` — bannis.

---

## 2. Projet — vue d'ensemble

**Nom :** ElecProDeals
**Type :** Application mobile B2B e-commerce
**Utilisateurs cibles :** Artisans, installateurs, grossistes (clients professionnels)
**Priorité client :** App installable depuis App Store + Google Play — commande autonome client pro en premier
**Cahier des charges complet :** `docs/CDC_Elec_Pro_Deals-v2.pdf`

### 3 rôles utilisateur
```typescript
enum UserRole {
  CLIENT_PRO  = 'CLIENT_PRO',   // Priorité 1 — parcours complet implémenté
  COMMERCIAL  = 'COMMERCIAL',   // Priorité 3 — après validation client
  ADMIN       = 'ADMIN',        // Backoffice web Next.js
}

enum CustomerTypology {
  ARTISAN          = 'ARTISAN',
  LARGE_INSTALLER  = 'LARGE_INSTALLER',
  WHOLESALER       = 'WHOLESALER',
}
```

---

## 3. Stack technique — IMMUABLE

| Couche | Technologie | Version |
|--------|-------------|---------|
| Mobile | React Native + Expo SDK managed | 54.0.31 |
| Router | Expo Router (file-based) | 6.0.14 |
| Styling mobile | NativeWind (TailwindCSS v3) | 4.1.23 |
| State global | Redux Toolkit | ^2.11.2 |
| Server state | TanStack Query | 5.90.7 |
| Storage local | react-native-mmkv | v4.x (voir §9) |
| Réseau | Axios | ^1.15.2 |
| Validation mobile | Zod v4 | ^4.3.6 |
| Animations | react-native-reanimated | 4.1.1 |
| Backend | NestJS + TypeScript strict | ^11.0.1 |
| ORM | TypeORM | ^0.3.28 |
| Base de données | PostgreSQL (local Docker dev) | — |
| Auth | JWT 15min / Refresh 7j (rotation) | — |
| Paiement | Stripe — Phase 2 uniquement | désactivé |
| Notifications | expo-notifications (FCM/APNs) | ^55.0.20 |
| Backoffice | Next.js App Router | 16.2.4 |
| Styling admin | TailwindCSS v4 | ^4 |
| Hébergement | OVH VPS France — après validation client | — |

### ⚠️ Tailwind — coexistence de versions
- **Mobile** : TailwindCSS **v3** via NativeWind → config `tailwind.config.js`
- **Admin** : TailwindCSS **v4** → config via `@import "tailwindcss"` dans `globals.css`
- Ne jamais copier-coller de configuration Tailwind entre les deux couches.

---

## 4. État d'avancement — ce qui est FAIT

### Backend NestJS ✅ Complet (après merge feat/backoffice)
Modules implémentés : `auth` · `users` · `catalog` · `orders` · `pricing` · `invoices` · `notifications` · `sage` · `stripe` (mocké) · `admin`

### Mobile React Native ✅ Complet (sauf rôle commercial)
| Route | État |
|-------|------|
| `/(auth)/login` | ✅ Zod validation, redirect par rôle |
| `/(client)/catalog` | ✅ Liste, recherche, prix B2B, panier |
| `/(client)/orders` | ✅ Redux cart + React Query historique |
| `/(client)/invoices` | ✅ Devis & factures mock Sage |
| `/(client)/notifications` | ✅ Liste depuis BDD |
| `/(client)/account` | ✅ Profil, déconnexion |
| `/(commercial)` | ⚠️ STUB — Phase 3 selon feedback client |

### Backoffice Next.js ✅ Complet
7 pages : `dashboard` · `clients` · `catalog` · `pricing` · `orders` · `invoices` · `notifications`

---

## 5. Ce qui RESTE à implémenter — dans l'ordre

### 🔴 Sprint 1 — Bloquant démo

**A. PATCH /orders/:id/status**
- Fichiers : `server/src/orders/orders.controller.ts` + `orders.service.ts`
- Statuts : `pending → confirmed → shipped → delivered`
- Guard : `ADMIN` et `COMMERCIAL` uniquement

**B. Sécurité admin — localStorage → httpOnly cookie**
- Migrer `admin_token` vers cookie `httpOnly` via Next.js route `/api/auth/session`

**C. Rate limiting**
- `@nestjs/throttler` sur `POST /auth/login` — max 5 tentatives/minute

**D. Helmet headers**
- `helmet()` dans `server/src/main.ts`

**E. Dashboard stats branchées BDD**
- Remplacer les 4 valeurs statiques par les vrais endpoints

### 🟠 Sprint 1 — Anti-pattern à corriger

**F. Créer users.controller.ts**
- Extraire les routes HTTP du `users.service.ts` vers un vrai controller
- Pattern NestJS : controller = routes HTTP, service = logique métier

### 🟡 Cosmétique — à nettoyer

**G. Unifier les fichiers de couleurs**
- `utils/colors.ts` et `constants/Colors.ts` sont un doublon
- Garder `constants/Colors.ts`, supprimer `utils/colors.ts`
- Mettre à jour les imports

**H. Supprimer PROJECT.md**
- Marqué "désynchronisé" — remplacer par un lien vers CLAUDE.md

### 🔲 Phase 3 — Après feedback client (ne pas implémenter avant signal)
- Rôle commercial mobile (`feat/commercial`)
- Stripe paiement CB réel (`STRIPE_ENABLED=true`)
- Sage API réelle (`SAGE_MOCK_MODE=false`)
- Import catalogue Excel
- Promotions temporaires (CDC §3.1 + §3.5)
- PDF factures (CDC §3.4)
- OVH déploiement production
- SSL pinning mobile
- Transporteurs FedEx / Geodis (optionnel)

---

## 6. Moteur de prix B2B — règles absolues

**Ne jamais modifier sans comprendre ce mécanisme.**

```
Priorité de résolution :
1. pricingSheetId individuel du client  (exception individuelle — priorité max)
   └─ Si absent →
2. Feuille par customerTypology          (règle de groupe)
   └─ Si absent →
3. publicPrice                           (prix catalogue)

Une feuille = N règles appliquées en CASCADE par sortOrder
Opérateurs : multiply (prix * value) | add (prix + value)
```

**3 feuilles seedées :**
```
sheet-artisan-standard    → multiply 0.90  (−10%)
sheet-gros-installateur   → multiply 0.82  (−18%)
sheet-grossiste           → multiply 0.75  (−25%)
```

---

## 7. SageService — règle absolue

**Aucun code ne doit appeler Sage directement. Tout passe par `SageService`.**

```typescript
@Injectable()
export class SageService {
  private get isMock(): boolean {
    return this.config.get('SAGE_MOCK_MODE') === 'true';
  }
  // Catalogue → PostgreSQL réel
  // Factures, devis → mock JSON statique
  // Commandes → BDD locale (sageOrderRef = null)
}
```

Pour activer Sage réel : remplacer uniquement `server/src/modules/sage/sage.service.ts` — aucun autre fichier ne change.

---

## 8. Authentification mobile — flux complet

```typescript
// Login
authService.login() → JWT access (15min) + refresh (7j)
  → MMKV.set('access_token', ...)   // Jamais AsyncStorage
  → MMKV.set('refresh_token', ...)
  → dispatch(setCredentials())

// Intercepteur Axios — 401 reçu → refresh automatique
// Refresh échoue → logout + redirect /(auth)/login

// Protection routes
useAuthGuard('CLIENT_PRO')   // app/(client)/_layout.tsx
useAuthGuard('COMMERCIAL')   // app/(commercial)/_layout.tsx
```

---

## 9. Dépendances — points d'attention

### Fixes à appliquer (Sprint 0 — à faire maintenant)
```bash
# MMKV v4 + nitro-modules compatible (risque crash Android si non fait)
npx expo install react-native-mmkv@latest react-native-nitro-modules@latest

# react-test-renderer doit matcher React 19
npx expo install react-test-renderer@19.1.0

# Supprimer passport-local (non utilisé)
cd server && npm uninstall passport-local @types/passport-local
```

### expo-blur — NE PAS supprimer
Utilisé dans `components/ui/TabBarBackground.ios.tsx` pour l'effet verre dépoli de la barre d'onglets iOS. C'est le comportement natif Apple attendu.

### Packages INTERDITS — ne jamais installer
| Package | Raison |
|---------|--------|
| `moment.js` | Abandonné, 66KB — utiliser `date-fns` ou `Intl` natif |
| `lodash` | 70KB — utiliser ES2022 natif |
| `react-native-paper` | Redondant avec NativeWind |
| `@react-native-firebase/*` | Conflit avec expo-notifications |
| `formik` | Redondant — Zod v4 suffit |

### Packages Phase 2 — ne pas installer avant signal
| Package | Déclencheur |
|---------|-------------|
| `@stripe/stripe-react-native` | `STRIPE_ENABLED=true` décidé |
| `@nestjs/throttler` | Sprint 1 sécurité |
| `helmet` | Sprint 1 sécurité |
| `react-native-ssl-public-key-pinning` | Build store final |

---

## 10. Structure codebase — points clés

### Mobile
- `components/ui/` — 25 composants NativeWind production-ready, ne pas dupliquer
- `components/catalog/` et `components/orders/` — vides, à remplir lors du sprint commercial
- `utils/colors.ts` — doublon à supprimer (garder `constants/Colors.ts`)
- `lib/` et `providers/` — helpers globaux, ne pas y mettre de logique métier

### Backend
- `users/` — **créer `users.controller.ts`** et y déplacer les routes HTTP depuis `users.service.ts`
- `common/guards/` — JwtAuthGuard + RolesGuard — ne jamais contourner ces guards
- `database/migrations/` — toujours créer une migration TypeORM, jamais `synchronize: true` en prod
- `database/seed.ts` — idempotent, à relancer si BDD vide

### Admin
- Token stocké en `localStorage` → **migrer vers `httpOnly` cookie** (Sprint 1 priorité 🔴)
- TailwindCSS v4 — syntaxe différente du mobile (v3), ne pas mélanger

---

## 11. RGPD — règles de code non négociables

```typescript
// ❌ JAMAIS logger des données personnelles
logger.log(`User ${user.email} logged in`);   // INTERDIT
logger.log(`Order ${orderId} by ${user.id}`); // OK — ID anonyme

// ✅ Soft delete obligatoire
@DeleteDateColumn()
deletedAt: Date;  // Jamais DELETE FROM

// ✅ JWT payload minimal
interface JwtPayload {
  sub: string;      // userId uniquement
  role: UserRole;
  iat: number;
  exp: number;      // Pas d'email, nom, téléphone
}

// ✅ Export RGPD disponible
// GET /users/:id/export — déjà implémenté
```

---

## 12. Conventions de code

### TypeScript strict
```typescript
// ✅ Toujours
interface CreateOrderDto { ... }
const result: OrderResponse = ...

// ❌ Jamais
const data: any = ...
// @ts-ignore
```

### Nommage
```
PascalCase      → Composants, Interfaces, Types, Enums, Classes
camelCase       → Variables, fonctions, hooks (useXxx)
SCREAMING_CASE  → Constantes, enums values, env variables
kebab-case      → Fichiers, dossiers, routes URL
```

### Commits (format obligatoire)
```
feat(orders): add PATCH status endpoint
fix(pricing): apply correct price sheet on B2B checkout
chore(deps): align mmkv to v4 with nitro-modules 0.35
refactor(users): extract controller from service
test(guards): add roles guard unit tests
security(admin): migrate localStorage to httpOnly cookie
```

### Git — branches
```
main      ← stable, livrable client — jamais de commit direct
develop   ← intégration — CI/CD tourne ici
feat/xxx  ← features
fix/xxx   ← corrections
```

---

## 13. Tests — plan de couverture

### Requis avant merge vers main
| Fichier | Ce qu'il teste |
|---------|---------------|
| `pricing.service.spec.ts` | ✅ Existe — compléter avec cascade + exceptions |
| `roles.guard.spec.ts` | CLIENT_PRO ne peut pas accéder aux routes ADMIN/COMMERCIAL |
| `sage.service.spec.ts` | Mock retourne des données conformes aux interfaces |
| `auth.dto.spec.ts` | Email invalide, password court, champs manquants |
| `orders.service.spec.ts` | Création, annulation, changement de statut |
| `users.controller.spec.ts` | À créer après extraction du controller |

### Non testé en POC (décision assumée)
- Composants React Native visuels
- Pages Next.js admin
- Migrations TypeORM
- Flow Stripe complet

---

## 14. Variables d'environnement

### `server/.env` (non commité)
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

## 15. Commandes utiles

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
npx tsc --noEmit
cd server && npx tsc --noEmit
cd admin && npx tsc --noEmit

# Tests
cd server && npm run test
```

### Credentials de test
```
admin@demo.fr              / password123
commercial@demo.fr         / password123
client@demo.fr             / password123
gros-installateur@demo.fr  / password123
```

---

## 16. Escalade — règle absolue

**Toute décision d'architecture** (nouvelle lib majeure, changement de pattern, modification schéma BDD, nouveau module) → remonter sur **Claude.ai Project "ElecProDeals"** avant d'implémenter.

Ne jamais prendre ces décisions seul dans une session Claude Code.
