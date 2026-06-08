# TASKS.md — ElecProDeals
> Kanban du projet — mis à jour par Claude Code à chaque fin de session.
> Référence : CLAUDE.md v3 · HANDOFF.md · Workflows & Standards doc
> Dernière mise à jour : Sprint 0 terminé — Juin 2026

---

## ✅ DONE — Sprint 0 (Fondations)

| Tâche | Commit | Notes |
|-------|--------|-------|
| Merge feat/backoffice → develop | `a797461` | 10 modules NestJS complets sur develop |
| CLAUDE.md v3 placé à la racine | — | Constitution du projet pour Claude Code |
| MMKV v4.3.1 + nitro-modules 0.35.9 | `a4f87a0` | Risque crash Android corrigé |
| react-test-renderer → 19.1.0 | `ace061b` | Aligné avec React 19 |
| Suppression passport-local | `fdce6a6` | Dépendance morte supprimée |
| HANDOFF.md mis à jour | `5f34c42` | Sprint 0 tracé |
| CI/CD GitHub Actions créé | `7ab287b` | TypeScript + ESLint + Jest sur 3 couches |
| Fix ESLint mobile — eslint.config.js | — | Config Expo manquante ajoutée |
| Fix ESLint server — CRLF + 2 vraies erreurs | — | prettier endOfLine auto + guard + unused var |
| Fix ESLint admin — 4 erreurs JSX/hooks | — | unescaped entities + useEffect fixes |
| Fix peer dependency @react-navigation | — | Conflit bottom-tabs résolu |
| CI/CD vert sur les 3 couches | run #4 | ✅ Mobile + Server + Admin |

---

## 🔴 IN PROGRESS — Sprint 1 (Finitions client pro)

> Branche : `feat/sprint1-client` — créée depuis develop ✅
> Objectif : parcours client professionnel 100% complet + sécurisé

| # | Tâche | Couche | Priorité |
|---|-------|--------|----------|
| 1 | ✅ `PATCH /orders/:id/status` — transitions + RolesGuard | Server | 🔴 Bloquant démo |
| 2 | ✅ Bouton statut aligné backend dans backoffice orders | Admin | 🔴 Bloquant démo |
| 3 | Migrer admin_token localStorage → httpOnly cookie (`/api/auth/session`) | Admin | 🔴 Sécurité |
| 4 | `@nestjs/throttler` sur POST /auth/login — max 5 req/min | Server | 🟠 Sécurité |
| 5 | `helmet()` dans server/src/main.ts | Server | 🟠 Sécurité |
| 6 | Dashboard stats branchées BDD (4 compteurs réels) | Admin | 🟠 Important |
| 7 | Créer `users.controller.ts` — extraire routes depuis users.service.ts | Server | 🟠 Anti-pattern |
| 8 | Unifier colors.ts / Colors.ts → garder constants/Colors.ts | Mobile | 🟡 Cosmétique |
| 9 | Supprimer PROJECT.md désynchronisé | Racine | 🟡 Cosmétique |

### Tests requis dans ce sprint
| Fichier | Ce qu'il teste |
|---------|---------------|
| `roles.guard.spec.ts` | CLIENT_PRO ne peut pas accéder aux routes ADMIN/COMMERCIAL |
| `sage.service.spec.ts` | Mock retourne données conformes aux interfaces TypeScript |
| `auth.dto.spec.ts` | Email invalide, password court, champs manquants |
| `orders.service.spec.ts` | Création, annulation, changement de statut |
| `users.controller.spec.ts` | À créer après extraction du controller |
| `pricing.service.spec.ts` | Compléter : exceptions individuelles + cascade + cas limites |

---

## 🟡 TODO — Sprint 2 (Distribution client)

> Branche : `feat/sprint2-distribution` — après Sprint 1 mergé
> Objectif : le client teste l'app sur son téléphone

| # | Tâche | Couche | Notes |
|---|-------|--------|-------|
| 1 | Configurer EAS (expo.dev account + eas.json) | Mobile | Profils : development, preview, production |
| 2 | `eas build --profile preview --platform all` | Mobile | QR code → client teste sur son téléphone |
| 3 | Héberger backend temporairement (Railway ou Render) | Server | En attendant OVH post-validation client |
| 4 | Variables d'environnement production (JWT secrets forts) | Server | GitHub Secrets + .env serveur |
| 5 | Merge develop → main | Git | Après CI/CD vert + tests manuels complets |
| 6 | Démo client | Livraison | Présentation + recueil feedback structuré |

---

## 🔲 TODO — Phase 3 (Selon feedback client)

> Ne pas implémenter avant signal explicite
> Ordre déterminé par les retours du client après démo

| Tâche | Dépendance | Notes |
|-------|-----------|-------|
| Rôle commercial mobile (feat/commercial) | Feedback client | 3 écrans + 2 endpoints backend |
| Stripe paiement CB réel | Feedback client | `STRIPE_ENABLED=true` — module déjà mocké |
| Sage API réelle | Credentials client | `SAGE_MOCK_MODE=false` — SageService déjà abstrait |
| Import catalogue Excel | Feedback client | Upload xlsx → parsing → ProductEntity |
| Promotions temporaires | Feedback client | CDC §3.1 + §3.5 |
| PDF factures téléchargeables | Feedback client | CDC §3.4 |
| OVH VPS production | Post-validation | Docker + PostgreSQL + NestJS + Nginx + SSL |
| SSL pinning mobile | Avant stores officiels | react-native-ssl-public-key-pinning |
| App Store iOS | Post-validation | Apple Developer 99$/an + review |
| Google Play Android | Post-validation | Google Play Console 25$ one-time |
| Transporteurs FedEx / Geodis | Optionnel | CDC §4.2 — selon besoin client |

---

## 📋 Instructions Claude Code — utilisation de ce fichier

### Début de session
```
"Lis CLAUDE.md et TASKS.md. Branche active : feat/xxx.
Objectif de cette session : [tâches du sprint en cours]."
```

### Pendant la session
- Marque chaque tâche terminée avec ✅ dans TASKS.md
- Un commit par tâche significative
- Si une nouvelle tâche émerge → l'ajouter dans le bon sprint

### Fin de session
```
"Mets à jour TASKS.md (tâches terminées) et HANDOFF.md 
(état exact du projet). Commite et push sur develop."
```

---

## 🔢 Compteurs de progression

| Sprint | Total | Done | Restant |
|--------|-------|------|---------|
| Sprint 0 — Fondations | 12 | 12 | 0 ✅ |
| Sprint 1 — Client pro | 9 + 6 tests | 2 | 13 |
| Sprint 2 — Distribution | 6 | 0 | 6 |
| Phase 3 — Post-feedback | 11 | 0 | 11 |

---

*ElecProDeals — mis à jour automatiquement par Claude Code à chaque session*