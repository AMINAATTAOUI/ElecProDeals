# ElecProDeals — Audit dépendances production
*Lead Dev review — 6 juin 2026*

---

## Verdict global

**94 dépendances au total. 88 sont saines et justifiées.**
**6 points d'action identifiés** — dont 2 urgents (risque crash prod), 2 importants, 2 cosmétiques.

---

## 🔴 URGENT — Risque crash en production

### 1. Mismatch MMKV v2 installé / API v3 utilisée dans le code

**Problème :**
Le `package.json` déclare `react-native-mmkv ^2.12.2` mais le code utilise l'API v3/v4 (`createMMKV()` au lieu de `new MMKV()`). De plus, `react-native-nitro-modules 0.32.0` est installé comme dépendance directe — ce module est la base de MMKV v4, pas v2.

La version actuelle sur npm est **4.3.1**. La v2 est abandonnée.

**Risque :**
- Crash au démarrage sur Android (`Failed to get NitroModules`) si la version installée et le code sont désynchronisés
- `react-native-nitro-modules 0.32.0` a des crashes Android connus (issue #980) — la version requise pour MMKV v4 stable est `≥ 0.35.0`

**Action :**
```bash
# Aligner sur MMKV v4 stable + nitro-modules compatible
npx expo install react-native-mmkv@latest react-native-nitro-modules@latest
```
Puis vérifier dans le code que `createMMKV()` est utilisé partout (pas `new MMKV()`).

---

### 2. `react-test-renderer 18.2.0` avec `react 19.1.0`

**Problème :**
`react-test-renderer` est en version `18.2.0` mais le projet tourne sur React 19. Les versions doivent être identiques — c'est une exigence stricte de React.

**Risque :**
- Les tests plangent silencieusement ou produisent des faux positifs
- Warning React en CI : `react-test-renderer@18 and react@19 are incompatible`

**Action :**
```bash
npx expo install react-test-renderer@19.1.0
```

---

## 🟠 IMPORTANT — Qualité production

### 3. `passport-local` et `@types/passport-local` — déclarés non utilisés

**Problème :**
Le handoff le précise explicitement : *"déclaré, non utilisé directement — login via AuthService"*. C'est une dépendance morte en production.

**Risque :**
- Surface d'attaque inutile (chaque dépendance = risque CVE potentiel)
- Confusion pour le prochain développeur qui prend le projet
- Bundle Node.js légèrement plus lourd

**Action :**
```bash
cd server
npm uninstall passport-local @types/passport-local
```
Vérifier qu'aucun fichier n'importe `passport-local` avant de supprimer.

---

### 4. Tailwind v4 (admin) vs v3 (mobile) — coexistence non documentée

**Problème :**
Le backoffice admin utilise TailwindCSS v4, le mobile utilise v3. Ce n'est pas un bug en soi — les deux sont isolés — mais la syntaxe de configuration est différente (`tailwind.config.js` v3 vs `@import "tailwindcss"` v4) et les classes utilitaires ont quelques différences.

**Risque :**
- Un dev qui copie-colle une classe du mobile vers l'admin (ou vice-versa) peut avoir un comportement inattendu
- La v4 admin est très récente — certains plugins CSS tiers ne sont pas encore compatibles

**Action :**
Pas de changement de version requis. Ajouter dans `CLAUDE.md` :
```
# Styling — ATTENTION coexistence versions
Mobile : TailwindCSS v3 (NativeWind) — config tailwind.config.js
Admin  : TailwindCSS v4 — config via @import "tailwindcss" dans globals.css
Ne pas mixer les syntaxes de configuration entre les deux couches.
```

---

## 🟡 COSMÉTIQUE — Dépendances POC à nettoyer avant livraison

### 5. `@dev-plugins/react-native-mmkv 0.4.0` — outil de debug uniquement

**Problème :**
Ce plugin Expo DevTools permet d'inspecter les valeurs MMKV dans le panneau de développement. Il n'a aucun rôle en production et ne doit pas être dans les dépendances régulières.

**Action :**
```bash
# Déplacer en devDependencies si ce n'est pas déjà le cas
# Ou supprimer si non utilisé activement
npm uninstall @dev-plugins/react-native-mmkv
```

---

### 6. `expo-blur ~15.0.8` — vérifier l'utilisation réelle

**Problème :**
`expo-blur` est listé mais aucune mention d'effet glassmorphism dans le handoff. C'est peut-être un résidu du boilerplate initial non utilisé.

**Action :**
Faire un grep dans le codebase :
```bash
grep -r "expo-blur\|BlurView" app/ components/ --include="*.tsx"
```
Si zéro résultat → supprimer. Si utilisé → conserver, c'est légitime.

---

## ✅ Ce qui est CORRECT et conforme aux standards store

### Mobile — stack validée par les standards App Store / Play Store 2026

| Package | Verdict | Justification |
|---------|---------|---------------|
| `expo 54.0.31` | ✅ Stable prod | SDK 54 = version LTS actuelle, utilisée par des milliers d'apps en store |
| `react-native 0.81.5` | ✅ Stable prod | New Architecture activée par défaut, requis par Apple depuis 2025 |
| `expo-router 6.0.14` | ✅ Standard actuel | File-based routing = pattern recommandé Expo pour les nouvelles apps |
| `@reduxjs/toolkit ^2.11.2` | ✅ Standard industrie | RTK est le standard Redux depuis 2022, utilisé par Netflix, Airbnb, etc. |
| `@tanstack/react-query 5.90.7` | ✅ Standard industrie | TanStack Query v5 = référence pour le server-state en React Native |
| `nativewind 4.1.23` | ✅ Stable prod | NativeWind v4 = version stable depuis fin 2024, compatible New Architecture |
| `axios ^1.15.2` | ✅ Standard industrie | Universellement utilisé, bien maintenu, SLA de sécurité solide |
| `zod ^4.3.6` | ✅ Correct | Zod v4 est stable, breaking changes vs v3 bien documentés |
| `react-native-reanimated 4.1.1` | ✅ Stable prod | Reanimated 4 est stable depuis juillet 2025, New Architecture native |
| `react-native-worklets 0.5.1` | ✅ Requis par Reanimated 4 | Dépendance obligatoire de Reanimated v4, pas un extra |
| `react-native-gesture-handler ~2.28.0` | ✅ Standard | Requis par navigation + bottom sheet, bien maintenu |
| `@gorhom/bottom-sheet ^5.2.10` | ✅ Stable prod | Bibliothèque de référence pour les bottom sheets en RN |
| `lucide-react-native ^0.542.0` | ✅ Standard actuel | Remplace @expo/vector-icons pour les nouvelles apps, plus léger |
| `react-native-svg ^15.15.4` | ✅ Requis | Dépendance de lucide, bien maintenu |
| `@expo/vector-icons 15.0.3` | ✅ Conservé | Compatible Expo, certains composants existants peuvent l'utiliser |
| `tailwind-merge + clsx + cva` | ✅ Trinity standard | Ces 3 packages ensemble = pattern standard shadcn/ui, très répandu |

### Backend — stack validée

| Package | Verdict | Justification |
|---------|---------|---------------|
| `@nestjs/* 11.x` | ✅ Dernière version majeure | NestJS 11 est stable depuis début 2025 |
| `typeorm ^0.3.28` | ✅ Stable | Version active, bien maintenue pour PostgreSQL |
| `class-validator + class-transformer` | ✅ Standard NestJS | Combo officiel pour la validation de DTOs dans NestJS |
| `bcryptjs ^3.0.3` | ✅ Correct | `bcryptjs` (JS pur) vs `bcrypt` (natif C++) — bcryptjs est plus portable, différence de perf négligeable pour un auth |
| `@swc/core` | ✅ Best practice | SWC comme compilateur en dev = démarrage 10x plus rapide que ts-node |
| `passport + passport-jwt` | ✅ Conservés | Utilisés activement pour la stratégie JWT |
| `rxjs ^7.8.1` | ✅ Requis NestJS | Dépendance interne NestJS, pas un choix, pas à supprimer |

### Admin — stack validée

| Package | Verdict | Justification |
|---------|---------|---------------|
| `next 16.2.4` | ✅ Version récente 2026 | App Router, Server Components, stable |
| `react 19.2.4` | ✅ Stable | React 19 est le standard actuel |
| `tailwindcss v4` | ✅ Stable pour le web | v4 est GA depuis début 2025, well-suited pour Next.js |
| `lucide-react ^1.11.0` | ✅ Standard | Même source que lucide-react-native, cohérence des icônes |

---

## Dépendances absentes à ne PAS ajouter avant validation

Ces packages sont souvent proposés automatiquement par des AI copilots. **Les refuser sans discussion** :

| Package | Pourquoi refuser |
|---------|-----------------|
| `moment.js` | Abandonné, 66KB — utiliser `date-fns` ou l'API Intl native |
| `lodash` | 70KB pour des fonctions disponibles en ES2022 natif |
| `react-native-paper` | Redondant avec NativeWind déjà en place |
| `@react-native-firebase/*` | On utilise Expo Notifications, Firebase direct crée un conflit |
| `formik` | Redondant — zod + react-hook-form si besoin, ou zod seul |
| Toute lib non maintenue depuis > 18 mois | Risque CVE, incompatibilité New Architecture |

---

## Dépendances à ajouter au bon moment (ne pas anticiper)

| Package | Quand | Raison |
|---------|-------|--------|
| `@stripe/stripe-react-native` | Phase 2 uniquement | Déjà planifié, `STRIPE_ENABLED=false` en place |
| `@nestjs/throttler` | Avant prod OVH | Rate limiting OWASP |
| `helmet` | Avant prod OVH | HTTP security headers |
| `react-native-ssl-public-key-pinning` | Avant build store | SSL pinning requis pour apps B2B |
| `expo-local-authentication` | Sprint suivant | Biométrie (Touch ID / Face ID) |

---

## Résumé des actions

| Priorité | Action | Effort |
|----------|--------|--------|
| 🔴 Urgent | Aligner MMKV v4 + nitro-modules ≥ 0.35.0 | 30 min |
| 🔴 Urgent | `react-test-renderer` → 19.1.0 | 5 min |
| 🟠 Important | Supprimer `passport-local` + types | 10 min |
| 🟠 Important | Documenter coexistence Tailwind v3/v4 dans CLAUDE.md | 10 min |
| 🟡 Cosmétique | Supprimer `@dev-plugins/react-native-mmkv` (ou mettre en devDep) | 5 min |
| 🟡 Cosmétique | Grep `expo-blur` → supprimer si non utilisé | 5 min |

**Temps total estimé : 1h15 max.**

---

*Audit réalisé en tant que Lead Developer iOS/Android — basé sur les standards App Store, Google Play et OWASP Mobile Top 10 — juin 2026*
