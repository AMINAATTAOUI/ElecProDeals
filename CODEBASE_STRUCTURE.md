# ElecProDeals — Structure de la codebase
*6 juin 2026*

---

```
ElecProDeals/                              ← Racine du monorepo
│
├── 📄 CLAUDE.md                           ← Constitution du projet (source de vérité IA)
├── 📄 HANDOFF.md                          ← Document de passation inter-sessions
├── 📄 DEPENDENCIES_AUDIT_REPORT.md        ← Audit des 94 dépendances
├── 📄 CODEBASE_STRUCTURE.md               ← Ce fichier
├── 📄 PROJECT.md                          ← Référence technique (désynchronisé — voir CLAUDE.md)
├── 📄 TASKS.md                            ← Backlog kanban (désynchronisé — voir CLAUDE.md)
├── 📄 README.md                           ← README standard Expo
├── 📄 package.json                        ← Dépendances mobile
├── 📄 package-lock.json
├── 📄 tsconfig.json                       ← Config TypeScript mobile (strict: true)
├── 📄 tailwind.config.js                  ← Config TailwindCSS v3 (NativeWind mobile)
├── 📄 metro.config.js                     ← Config Metro bundler Expo
├── 📄 babel.config.js                     ← Config Babel Expo
├── 📄 app.json                            ← Config Expo (name, slug, icons, splash)
├── 📄 global.css                          ← CSS global (NativeWind)
├── 📄 nativewind-env.d.ts                 ← Types NativeWind
├── 📄 expo-env.d.ts                       ← Types Expo Router
├── 📄 docker-compose.yml                  ← PostgreSQL local (container elecprodeals-db)
├── 📄 .env                                ← Variables d'env mobile (non commité)
├── 📄 .env.example                        ← Template .env
├── 📄 .gitignore
├── 📄 Gemfile                             ← Ruby (requis pour CocoaPods iOS)
│
├── 📁 docs/
│   └── 📄 CDC_Elec_Pro_Deals-v2.pdf       ← Cahier des charges complet (référence absolue)
│
├── 📁 .github/
│   └── 📄 copilot-instructions.md         ← Instructions GitHub Copilot (VS Code)
│
├── 📁 assets/
│   ├── 📁 fonts/                          ← Polices personnalisées
│   └── 📁 images/                         ← Images (icône app, splash, etc.)
│
│
│ ════════════════════════════════════════
│  MOBILE — Expo Router (file-based)
│ ════════════════════════════════════════
│
├── 📁 app/                                ← Routes Expo Router
│   ├── 📄 _layout.tsx                     ← Root layout (Redux Provider, QueryProvider, fonts)
│   ├── 📄 index.tsx                       ← Splash/redirect (vérifie auth → route)
│   ├── 📄 modal.tsx                       ← Stack modale global
│   ├── 📄 +not-found.tsx                  ← Page 404
│   ├── 📄 +html.tsx                       ← Template HTML Expo Web
│   │
│   ├── 📁 (auth)/                         ← Routes publiques (non authentifiées)
│   │   ├── 📄 _layout.tsx                 ← Layout auth (fond neutre)
│   │   └── 📄 login.tsx                   ← Écran login (Zod validation, redirect par rôle)
│   │
│   ├── 📁 (client)/                       ← Espace client professionnel (tab navigation)
│   │   ├── 📄 _layout.tsx                 ← Tab layout 5 onglets + useAuthGuard('client')
│   │   ├── 📁 catalog/
│   │   │   └── 📄 index.tsx               ← Liste produits, recherche, panier, prix B2B
│   │   ├── 📁 orders/
│   │   │   └── 📄 index.tsx               ← Panier actif (Redux) + historique commandes (RQ)
│   │   ├── 📁 invoices/
│   │   │   └── 📄 index.tsx               ← Tabs Factures / Devis (mock Sage)
│   │   ├── 📁 notifications/
│   │   │   └── 📄 index.tsx               ← Liste notifications depuis BDD
│   │   └── 📁 account/
│   │       └── 📄 index.tsx               ← Profil utilisateur + déconnexion
│   │
│   ├── 📁 (commercial)/                   ← Espace commercial ⚠️ STUB
│   │   ├── 📄 _layout.tsx                 ← Stack layout + useAuthGuard('commercial')
│   │   └── 📄 index.tsx                   ← Dashboard placeholder (à implémenter)
│   │
│   └── 📁 (admin)/                        ← Espace admin mobile
│       ├── 📄 _layout.tsx
│       └── 📄 index.tsx                   ← Redirige vers backoffice web
│
├── 📁 components/
│   ├── 📄 external-link.tsx               ← Lien externe (ouvre navigateur)
│   ├── 📄 theme-toggle.tsx                ← Toggle dark/light mode
│   ├── 📁 catalog/                        ← (vide — .gitkeep)
│   ├── 📁 orders/                         ← (vide — .gitkeep)
│   ├── 📁 shared/                         ← (vide — .gitkeep)
│   └── 📁 ui/                             ← 25 composants NativeWind production-ready
│       ├── 📄 index.ts                    ← Barrel export
│       ├── 📄 badge.tsx
│       ├── 📄 button.tsx
│       ├── 📄 card.tsx
│       ├── 📄 checkbox.tsx / checkbox.ios.tsx
│       ├── 📄 data-table.tsx
│       ├── 📄 dialog.tsx
│       ├── 📄 drawer.tsx
│       ├── 📄 flat-list.tsx
│       ├── 📄 IconSymbol.tsx / IconSymbol.ios.tsx
│       ├── 📄 input.tsx / input.ios.tsx
│       ├── 📄 keyboard-avoiding-view.tsx
│       ├── 📄 label.tsx
│       ├── 📄 pressable.tsx
│       ├── 📄 safe-area-view.tsx
│       ├── 📄 scroll-view.tsx
│       ├── 📄 select.tsx
│       ├── 📄 sheet.tsx
│       ├── 📄 spinner.tsx
│       ├── 📄 switch.tsx / switch.ios.tsx
│       ├── 📄 TabBarBackground.tsx / TabBarBackground.ios.tsx  ← expo-blur sur iOS
│       ├── 📄 text.tsx
│       ├── 📄 theme.tsx
│       ├── 📄 view.tsx
│       └── 📁 lib/ + 📁 utils/            ← Helpers internes composants UI
│
├── 📁 services/                           ← Appels API REST vers le backend
│   ├── 📄 api.ts                          ← Instance Axios + intercepteurs JWT (refresh rotation)
│   ├── 📄 auth.service.ts                 ← login(), logout(), me(), getStoredTokens()
│   ├── 📄 catalog.service.ts              ← getProducts(), searchProducts(), getProductById()
│   ├── 📄 orders.service.ts               ← createOrder(), getOrders(), cancelOrder()
│   ├── 📄 sage.service.ts                 ← (mobile) SageService client — non utilisé directement
│   └── 📄 invoices.service.ts             ← getInvoices(), getQuotes()
│
├── 📁 stores/                             ← Redux Toolkit
│   ├── 📄 store.ts                        ← Configuration du store Redux
│   ├── 📄 auth.slice.ts                   ← user, accessToken, isAuthenticated
│   ├── 📄 cart.slice.ts                   ← items[], addItem, removeItem, updateQuantity, clearCart
│   └── 📄 ui.slice.ts                     ← État UI global (loading, modales, etc.)
│
├── 📁 types/                              ← Interfaces TypeScript partagées (mobile)
│   ├── 📄 user.types.ts                   ← UserRole, CustomerType, AuthUser, JwtPayload
│   ├── 📄 product.types.ts                ← Product, StockStatus, Category
│   ├── 📄 order.types.ts                  ← Order, OrderStatus, OrderItem, CartItem
│   ├── 📄 invoice.types.ts                ← Invoice, Quote, InvoiceStatus, QuoteStatus
│   └── 📄 pricing.types.ts                ← PriceSheet, PricingRule, ComputedPrice
│
├── 📁 hooks/
│   ├── 📄 useAppStore.ts                  ← useAppDispatch + useAppSelector typés
│   └── 📄 useAuthGuard.ts                 ← Redirect automatique selon rôle
│
├── 📁 providers/
│   └── 📄 query-provider.tsx              ← TanStack Query Provider (QueryClient)
│
├── 📁 lib/
│   ├── 📄 mmkvStorage.ts                  ← Abstraction MMKV (in-memory Expo Go / réel EAS)
│   ├── 📄 query-client.ts                 ← Configuration QueryClient (staleTime, retry)
│   ├── 📄 use-persisted-color-scheme.ts   ← Hook dark/light mode persisté
│   └── 📄 utils.ts                        ← Helpers généraux (cn(), etc.)
│
├── 📁 utils/
│   └── 📄 colors.ts                       ← Palette de couleurs
│
├── 📁 constants/
│   └── 📄 Colors.ts                       ← Constantes de couleurs (dark/light)
│
├── 📁 scripts/
│   ├── 📁 hooks/                          ← Git hooks scripts
│   └── 📄 install-hooks.sh                ← Installation des git hooks
│
└── 📁 __tests__/
    └── 📄 init.test.ts                    ← Test de base (smoke test)


│ ════════════════════════════════════════
│  BACKEND — NestJS
│ ════════════════════════════════════════

server/
├── 📄 package.json                        ← Dépendances NestJS
├── 📄 tsconfig.json                       ← TypeScript strict backend
├── 📄 nest-cli.json                       ← Config NestJS CLI (builder: swc)
├── 📄 .env                                ← Variables d'env serveur (non commité)
│
└── 📁 src/
    ├── 📄 main.ts                         ← Bootstrap NestJS (ValidationPipe global, CORS, seed)
    ├── 📄 app.module.ts                   ← Registre des 8 modules
    ├── 📄 app.controller.ts               ← Health check GET /
    ├── 📄 app.controller.spec.ts          ← Test unitaire AppController
    ├── 📄 app.service.ts
    │
    ├── 📁 auth/                           ← Module authentification JWT
    │   ├── 📄 auth.module.ts
    │   ├── 📄 auth.controller.ts          ← POST /auth/login, POST /auth/refresh, GET /auth/me
    │   ├── 📄 auth.service.ts             ← login(), refresh(), generateTokens()
    │   ├── 📁 dto/
    │   │   ├── 📄 login.dto.ts            ← @IsEmail, @MinLength(8)
    │   │   └── 📄 refresh-token.dto.ts    ← @IsString, @IsNotEmpty
    │   └── 📁 strategies/
    │       ├── 📄 jwt.strategy.ts         ← Vérifie access token (ConfigService, pas de fallback)
    │       └── 📄 jwt-refresh.strategy.ts ← Vérifie refresh token (from body)
    │
    ├── 📁 users/                          ← Module utilisateurs + RGPD
    │   ├── 📄 users.module.ts
    │   └── 📄 users.service.ts            ← findAll, findByEmail, findById, update,
    │                                         deleteUser (RGPD), exportUserData (RGPD)
    │                                         ⚠️ Pas de users.controller.ts → routes dans service
    │
    ├── 📁 catalog/                        ← Module catalogue produits
    │   ├── 📄 catalog.module.ts
    │   ├── 📄 catalog.controller.ts       ← GET /catalog, GET /catalog/search, GET /catalog/:id
    │   └── 📄 catalog.service.ts          ← Délègue à SageService + PricingService
    │
    ├── 📁 orders/                         ← Module commandes
    │   ├── 📄 orders.module.ts
    │   ├── 📄 orders.controller.ts        ← POST /orders, GET /orders, GET /orders/:id,
    │   │                                     PATCH /orders/:id/cancel
    │   ├── 📄 orders.service.ts           ← createOrder, findAll, findOne, cancelOrder
    │   └── 📁 dto/
    │       └── 📄 order.dto.ts            ← CreateOrderDto, CreateOrderItemDto, UpdateOrderStatusDto
    │
    ├── 📁 sage/                           ← SageService — abstraction Sage 100 (RÈGLE ABSOLUE)
    │   ├── 📄 sage.module.ts
    │   └── 📄 sage.service.ts             ← Catalogue → PostgreSQL réel
    │                                         Factures/Devis → mock JSON (POC)
    │                                         Switch mock→réel : remplacer uniquement ce fichier
    │
    ├── 📁 common/                         ← Guards et décorateurs partagés
    │   ├── 📁 guards/
    │   │   ├── 📄 jwt-auth.guard.ts       ← Vérifie présence et validité du JWT
    │   │   └── 📄 roles.guard.ts          ← Vérifie le rôle requis (@Roles decorator)
    │   └── 📁 decorators/
    │       ├── 📄 current-user.decorator.ts  ← @CurrentUser() → payload JWT
    │       └── 📄 roles.decorator.ts         ← @Roles('admin', 'commercial')
    │
    ├── 📁 database/                       ← Configuration TypeORM + entités + seed
    │   ├── 📄 database.module.ts          ← TypeOrmModule.forRootAsync (ConfigService)
    │   ├── 📄 seed.ts                     ← Seed initial idempotent (users + products)
    │   └── 📁 entities/
    │       ├── 📄 user.entity.ts          ← Table users (id, email, passwordHash, role,
    │       │                                 firstName, lastName, companyName, siret,
    │       │                                 customerType, pricingSheetId, isActive...)
    │       ├── 📄 product.entity.ts       ← Table products (sageRef, name, category,
    │       │                                 publicPrice, stockStatus, unit...)
    │       ├── 📄 order.entity.ts         ← Table orders (orderNumber, clientId,
    │       │                                 status, paymentMethod, total, sageOrderRef...)
    │       └── 📄 order-item.entity.ts    ← Table order_items (productRef, quantity,
    │                                         unitPrice, lineTotal)
    │
    └── 📁 types/                          ← Interfaces TypeScript partagées (backend)
        ├── 📄 user.types.ts               ← UserRole, CustomerType, JwtPayload, AuthTokens
        ├── 📄 product.types.ts            ← StockStatus
        ├── 📄 order.types.ts              ← OrderStatus
        ├── 📄 invoice.types.ts            ← Invoice, Quote, InvoiceStatus, QuoteStatus
        └── 📄 pricing.types.ts            ← ComputedPrice, PriceSheet, PricingRule


│ ════════════════════════════════════════
│  BACKOFFICE — Next.js Admin
│ ════════════════════════════════════════

admin/
├── 📄 package.json                        ← Next.js + TailwindCSS v4 + lucide-react
├── 📄 tsconfig.json
├── 📄 next.config.ts
├── 📄 .env.local                          ← Variables d'env admin (non commité)
│
├── 📁 app/                                ← Next.js App Router
│   ├── 📄 layout.tsx                      ← Root layout (metadata, fonts)
│   ├── 📄 page.tsx                        ← Redirige → /login
│   ├── 📄 globals.css                     ← @import "tailwindcss" (TailwindCSS v4)
│   │
│   ├── 📁 login/
│   │   └── 📄 page.tsx                    ← Formulaire login admin, stockage token localStorage
│   │
│   └── 📁 (admin)/                        ← Pages protégées (vérifient token localStorage)
│       ├── 📄 layout.tsx                  ← Sidebar navigation + header
│       ├── 📁 dashboard/
│       │   └── 📄 page.tsx                ← Stats (statiques) + liens rapides
│       ├── 📁 clients/
│       │   └── 📄 page.tsx                ← Liste clients, activation, assignation feuille de prix
│       ├── 📁 catalog/
│       │   └── 📄 page.tsx                ← Liste produits
│       ├── 📁 pricing/
│       │   └── 📄 page.tsx                ← CRUD feuilles de prix et règles
│       ├── 📁 orders/
│       │   └── 📄 page.tsx                ← Liste commandes + filtres statut
│       ├── 📁 invoices/
│       │   └── 📄 page.tsx                ← Factures + devis (mock Sage)
│       └── 📁 notifications/
│           └── 📄 page.tsx                ← Envoi ciblé/broadcast + historique
│
└── 📁 lib/
    ├── 📄 api.ts                          ← apiFetch() — wrapper fetch avec Bearer token
    └── 📄 types.ts                        ← Types TypeScript admin (User, PriceSheet,
                                              Notification, Invoice, Quote...)
```

---

## Légende des statuts

| Icône | Signification |
|-------|--------------|
| ✅ | Implémenté et fonctionnel |
| ⚠️ STUB | Fichier créé mais logique non implémentée |
| 🔴 TODO | Manquant, bloquant pour la démo |
| (vide — .gitkeep) | Dossier prévu mais pas encore de fichiers |

## Notes importantes pour Claude.ai

1. **Le dossier `admin/` n'a pas de code source visible** sur la branche `develop` — les pages admin (dashboard, clients, catalog, etc.) ont été développées sur la branche `feat/backoffice`. Pour travailler sur l'admin, checker cette branche.

2. **Le backend `server/src/` est incomplet** sur `develop` — les modules `pricing/`, `invoices/`, `notifications/`, `stripe/` ainsi que les entités `PriceSheetEntity`, `PricingRuleEntity`, `NotificationEntity` existent sur `feat/backoffice` uniquement.

3. **Branche à merger** : `feat/backoffice` → `develop` → `main` avant la démo client.

4. **`services/notifications.service.ts`** et **`types/lucide-overrides.d.ts`** existent sur `feat/backoffice` mais pas sur `develop`.
