# TASKS.md — ElecProDeals Backlog

> Kanban technique du projet. Mis à jour après chaque étape.
> Référence CC : `docs/CDC_Elec_Pro_Deals-v2.pdf` | Architecture : `PROJECT.md`

---

## 🔲 TODO

### PHASE 2 — Authentification
- [ ] **feat/auth** — Écran Login (email + mot de passe)
- [ ] **feat/auth** — JWT access token (15min) + refresh token (7j) avec rotation
- [ ] **feat/auth** — Stockage tokens MMKV (chiffré)
- [ ] **feat/auth** — Interceptor Axios — renouvellement automatique du token expiré
- [ ] **feat/auth** — Biométrie Touch ID / Face ID (optionnel utilisateur)
- [ ] **feat/auth** — Déconnexion automatique à l'expiry

### PHASE 3 — Types TypeScript partagés
- [ ] **feat/types** — `user.types.ts` : User, Role (client | commercial | admin)
- [ ] **feat/types** — `product.types.ts` : Product, StockStatus, Category
- [ ] **feat/types** — `order.types.ts` : Order, OrderStatus, OrderItem
- [ ] **feat/types** — `invoice.types.ts` : Invoice, Quote, InvoiceStatus
- [ ] **feat/types** — `pricing.types.ts` : PriceSheet, PricingRule, CustomerType

### PHASE 4 — SageService (mocké)
- [ ] **feat/sage** — Interface complète `SageService` (contrat TypeScript)
- [ ] **feat/sage** — Mock catalogue produits (20 références réalistes)
- [ ] **feat/sage** — Mock clients (artisan, gros installateur, grossiste)
- [ ] **feat/sage** — Mock feuilles de prix (règles par typologie)
- [ ] **feat/sage** — Mock devis et factures
- [ ] **feat/sage** — Mock statuts commandes

### PHASE 5 — Catalogue Produits
- [ ] **feat/catalog** — Liste produits avec recherche multicritère
- [ ] **feat/catalog** — Fiche produit détaillée (prix, stock, délais)
- [ ] **feat/catalog** — Badge statut stock (disponible / rupture / délai)
- [ ] **feat/catalog** — Moteur feuilles de prix B2B (calcul prix par client)
- [ ] **feat/catalog** — Promotions temporaires (affichage campagnes)

### PHASE 6 — Panier & Commande
- [ ] **feat/cart** — Panier (ajout, suppression, quantités)
- [ ] **feat/cart** — Redux slice `cart.slice.ts`
- [ ] **feat/orders** — Processus de commande (checkout)
- [ ] **feat/orders** — Envoi bon de commande → SageService
- [ ] **feat/orders** — Suivi statut commande (en cours / expédiée / livrée)

### PHASE 7 — Devis & Factures
- [ ] **feat/invoices** — Liste devis client (depuis SageService)
- [ ] **feat/invoices** — Liste factures client (depuis SageService)
- [ ] **feat/invoices** — Suivi statut (accepté / en attente / facturé / payé)
- [ ] **feat/invoices** — Téléchargement PDF *(à confirmer avec client)*

### PHASE 8 — Notifications Push
- [ ] **feat/notifications** — Config FCM (Android) + APNs (iOS)
- [ ] **feat/notifications** — Notification changement statut commande
- [ ] **feat/notifications** — Notification nouvelle campagne promo
- [ ] **feat/notifications** — Gestion depuis backoffice (par client)

### PHASE 9 — Rôle Commercial
- [ ] **feat/commercial** — Parcours commande pour le compte d'un client
- [ ] **feat/commercial** — Liste des clients du portefeuille

### PHASE 10 — Backoffice Admin (Next.js)
- [ ] **feat/admin** — Setup Next.js admin app
- [ ] **feat/admin** — Gestion clients (créer / modifier / supprimer)
- [ ] **feat/admin** — Import catalogue Excel
- [ ] **feat/admin** — Gestion feuilles de prix
- [ ] **feat/admin** — Suivi commandes en cours
- [ ] **feat/admin** — Gestion promotions + notifications push

### PHASE 11 — Stripe (Phase 2)
- [ ] **feat/stripe** — Activer le module Stripe (remplacement du mock)
- [ ] **feat/stripe** — Paiement CB natif mobile

---

## ⚙️ IN PROGRESS

### PHASE 1 — Setup Projet Expo ← ON EST ICI
- [ ] Scaffolding projet avec `bunx fast-expo-app@latest` (NativeWind + React Query + Jest)
- [ ] Import composants UI depuis `chvvkrishnakumar/expo-nativewind-template`
- [ ] Structure de dossiers conforme à `PROJECT.md`
- [ ] Configurer `.env` + variables d'environnement (API URL, etc.)
- [ ] Vérifier TypeScript strict dans `tsconfig.json`
- [ ] Premier écran de test (App fonctionnelle sur simulateur)

---

## ✅ DONE

- [x] Cahier des charges analysé
- [x] Stack technique décidée (React Native + Expo, NestJS, PostgreSQL, Next.js)
- [x] Stratégie Sage validée (SageService mocké → réel)
- [x] Stratégie Stripe validée (module isolé, phase 2)
- [x] Hébergement OVH validé
- [x] 3 briques GitHub identifiées et vérifiées sur GitHub
- [x] Architecture dossiers définie
- [x] `PROJECT.md` créé
- [x] `.github/copilot-instructions.md` configuré
- [x] Repo Git initialisé (main + develop)
- [x] Repo GitHub privé connecté + auto-push hook actif
- [x] `.gitignore` Expo/RN configuré

---

*Dernière mise à jour : Avril 2026*
