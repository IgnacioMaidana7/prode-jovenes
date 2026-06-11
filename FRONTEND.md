# Prode Jóvenes — Resumen del Frontend

Aplicación de pronósticos (prode) para un torneo mundialista. SPA construida con **React 19 + TypeScript + Vite**, con UI basada en **Tailwind v4 + shadcn/ui + Radix**, animaciones con **Framer Motion** y estado global con **Zustand** (persistido en `localStorage`).

> Actualmente todos los datos son **mockeados** dentro de `src/data/*`. La integración real con Supabase ya está iniciada del lado del backend (`supabase/functions/sync-results`) pero el frontend todavía no consume esos endpoints.

---

## 1. Stack y dependencias clave

| Categoría | Librerías |
|-----------|-----------|
| Framework | `react@19`, `react-dom@19`, `react-router-dom@7` |
| Build | `vite@8`, `@vitejs/plugin-react` |
| Estilos | `tailwindcss@4`, `@tailwindcss/vite`, `tw-animate-css`, `shadcn`, `class-variance-authority`, `tailwind-merge`, `clsx` |
| UI primitives | `radix-ui`, `lucide-react`, `sonner`, `next-themes`, `react-day-picker` |
| Estado | `zustand@5` (con `persist` + `createJSONStorage`) |
| Data fetching (instalado, sin uso aún) | `@tanstack/react-query`, `@supabase/supabase-js` |
| Formularios | `react-hook-form`, `@hookform/resolvers`, `zod` |
| Animaciones | `framer-motion@12` |
| Tipografías | Anybody (display), Hanken Grotesk (sans), JetBrains Mono (mono), Geist |
| Banderas | `country-flag-emoji-polyfill`, helper propio `src/lib/flags.tsx` |
| Fechas | `date-fns` con locale `es` |

Scripts (`package.json`): `dev`, `build` (`tsc -b && vite build`), `lint`, `preview`.

---

## 2. Estructura de carpetas (`src/`)

```
src/
├── main.tsx              # Entry: monta <App/>, aplica polyfill de banderas emoji
├── App.tsx               # Definición del router (createBrowserRouter)
├── index.css             # Tailwind v4 + tokens del design system (tema "Stadia Nocturna")
├── App.css               # Restos / estilos legacy
│
├── assets/               # hero.png, react.svg, vite.svg
│
├── components/
│   ├── layout/           # Shell de la app
│   │   ├── AppShell.tsx          # Layout protegido: Sidebar + TopBar + <Outlet/> + Toaster
│   │   ├── Sidebar.tsx           # Nav lateral (desktop ≥ lg)
│   │   ├── MobileBottomNav.tsx   # Nav inferior fijo (mobile < lg)
│   │   └── TopBar.tsx            # Header mobile (logo, badge de predicciones, avatar)
│   │
│   ├── prode/            # Componentes de dominio del prode
│   │   ├── BrandLogo.tsx         # Logo "PRODE ARGENTINA · Mundialista 2026"
│   │   ├── GroupMatchCard.tsx    # Card de partido de fase de grupos
│   │   ├── BracketNode.tsx       # Nodo de bracket eliminatorio
│   │   ├── ScoreInput.tsx        # Inputs numéricos para pronóstico (home/away)
│   │   ├── LeaderboardRow.tsx    # Fila de tabla de posiciones
│   │   ├── ProfileHero.tsx       # Hero del perfil del usuario
│   │   ├── LiveBadge.tsx         # Badge "EN VIVO" con pulso
│   │   ├── RuleCard.tsx          # Tarjeta de regla / sistema de puntos
│   │   └── PrizeCard.tsx         # Tarjeta de premio principal
│   │
│   └── ui/               # Wrappers de shadcn/ui (Radix + cva)
│       (alert, alert-dialog, avatar, badge, button, calendar, card,
│        checkbox, dialog, input, label, pagination, popover,
│        scroll-area, select, separator, skeleton, sonner, table, tabs)
│
├── views/                # Una vista por ruta
│   ├── HomeView.tsx              # "/"          → hero + partido en vivo + próximos + accesos rápidos
│   ├── LoginView.tsx             # "/login"     → form con react-hook-form + zod
│   ├── ReglasView.tsx            # "/reglas"    → sistema de puntos + premio
│   ├── GruposView.tsx            # "/grupos"    → Tabs A/B/C/D con GroupMatchCard
│   ├── EliminatoriasView.tsx     # "/eliminatorias" → bracket R16 → QF → SF → F
│   ├── LeaderboardView.tsx       # "/leaderboard"   → ranking general
│   └── PerfilView.tsx            # "/perfil"        → hero + stats + historial
│
├── stores/               # Estado global Zustand (persistido en localStorage)
│   ├── auth.store.ts             # Usuario mock + login/logout + updatePoints
│   ├── predictions.store.ts      # Pronósticos por matchId (home/away/savedAt)
│   ├── ui.store.ts               # Grupo activo + estado del sidebar
│   └── index.ts                  # Re-exports
│
├── data/                 # Datos mock estáticos
│   ├── teams.ts                  # 16 selecciones agrupadas A–D
│   ├── groups.ts                 # Definición de grupos
│   ├── matches.ts                # groupMatches[] + knockoutMatches[]
│   ├── leaderboard.ts            # 12 entradas de ranking
│   └── rules.ts                  # Reglas y sistema de puntos
│
├── lib/                  # Helpers
│   ├── utils.ts                  # cn() = twMerge(clsx(...))
│   ├── format.ts                 # formatMatchDate/Time, formatPoints, formatOrdinal (date-fns es)
│   ├── motion.ts                 # Variants de Framer Motion (fadeUp, scaleIn, stagger, cardHover, livePulse…)
│   └── flags.tsx                 # <Flag/> que renderiza emoji de bandera desde código ISO
│
├── hooks/
│   ├── use-store.ts              # Selector tipado sobre stores Zustand
│   └── use-reduced-motion.ts     # Detecta prefers-reduced-motion
│
└── types/                # (vacío por ahora)
```

---

## 3. Routing (`src/App.tsx`)

```ts
createBrowserRouter([
  { path: "/login", element: <LoginView /> },
  {
    path: "/",
    element: <AppShell />,        // layout con Sidebar + TopBar + Outlet
    children: [
      { index: true,                element: <HomeView /> },
      { path: "reglas",             element: <ReglasView /> },
      { path: "grupos",             element: <GruposView /> },
      { path: "eliminatorias",      element: <EliminatoriasView /> },
      { path: "leaderboard",        element: <LeaderboardView /> },
      { path: "perfil",             element: <PerfilView /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
```

Las transiciones entre páginas se manejan en `AppShell` con `AnimatePresence mode="wait"` y un `motion.div` con `key={location.pathname}`.

---

## 4. Estado global (Zustand)

Los tres stores usan `persist` con `createJSONStorage(() => localStorage)`.

### `auth.store.ts` — `useAuthStore`
- `user: User | null` (id, name, email, points, rank)
- `isAuthenticated: boolean`
- `login(email, password)` — simulado con `setTimeout(600ms)`, setea un `MOCK_USER`
- `logout()`, `updatePoints(delta)`
- Selectores: `useUser`, `useIsAuthenticated`, `useLogin`, `useLogout`
- Clave de persistencia: `prode.auth`

> Hoy arranca con `isAuthenticated: true` y un usuario mock ("Hincha", 1250 pts, rank 8).

### `predictions.store.ts` — `usePredictionsStore`
- `byMatch: Record<matchId, Prediction>` donde `Prediction = { matchId, homeScore, awayScore, savedAt }`
- `savePrediction(matchId, home, away)` — guarda con `savedAt = new Date().toISOString()`
- `getPrediction(matchId)`, `clearAll()`, `count()`
- Selectores: `usePrediction(matchId)`, `useSavePrediction()`
- Clave de persistencia: `prode.predictions`

### `ui.store.ts` — `useUiStore`
- `activeGroup: "A" | "B" | "C" | "D"` (default `"A"`)
- `sidebarOpen` + `toggleSidebar`, `setSidebar`
- Solo se persiste `activeGroup` (`partialize`)
- Clave de persistencia: `prode.ui`

---

## 5. Datos mock (`src/data/`)

- **`teams.ts`** — 16 selecciones repartidas en 4 grupos (A: AR/CA/PE/CL · B: US/MX/UY/PA · C: BR/CO/EC/VE · D: ES/FR/NL/MA). Expone `teams`, `teamsByCode`, `getTeam(code)`.
- **`groups.ts`** — `groups: Group[]` derivado de `teams` + `groupsById`.
- **`matches.ts`** — `groupMatches` (16 partidos de fase de grupos con `status: "scheduled" | "live" | "finished"`) + `knockoutMatches` (R16 → QF → SF → F, con `fromHome/fromAway` para cruces a definir). Incluye `getMatchById`.
- **`leaderboard.ts`** — 12 entradas con `rank`, `name`, `points`, `trend`, `trendDelta`, flag `isCurrentUser` en la posición 8.
- **`rules.ts`** — 3 reglas: Adivinar Ganador (+5), Resultado Exacto (+10), Campeón (+50). También exporta `scoring`.

---

## 6. Diseño y theming

- **Tailwind v4** vía plugin de Vite + `shadcn/tailwind.css`.
- Tema custom **"Passion Prode — Stadia Nocturna"** definido en `src/index.css` con tokens en `oklch()`:
  - **Background:** negro profundo
  - **Primary:** naranja pasión `#FF8C00`
  - **Accent:** gold `#FFD700`
  - **Secondary:** bronze `#8B7355`
- Fuentes: `--font-display: Anybody Variable`, `--font-sans: Hanken Grotesk Variable`, `--font-mono: JetBrains Mono`.
- Clases utilitarias propias usadas en todo el código: `gradient-accent-text`, `glow-primary`, `font-mono-label` (definidas en `index.css`).
- Componentes UI (`src/components/ui/*`) son los típicos shadcn/Radix re-empaquetados con CVA para variantes (`button` con `variant="gradient"`, `card size="sm"`, `tabs variant="line"`, etc.).

---

## 7. Animaciones (`src/lib/motion.ts`)

Catálogo de `Variants` y helpers reutilizables:
- `fadeUp`, `fadeIn`, `scaleIn`, `slideInLeft`, `slideInRight`
- `staggerContainer(staggerChildren, delayChildren)`, `staggerItem`
- `cardHover` (hover/tap con spring), `tapScale`
- `pageTransition`, `livePulse` (badge "EN VIVO"), `shimmerTransition`

Casi todas las vistas envuelven el contenido en un `motion.div` con `staggerContainer` y secciones con `fadeUp`.

---

## 8. Funcionalidad por vista

| Ruta | Vista | Qué hace |
|------|-------|----------|
| `/login` | `LoginView` | Form con `react-hook-form` + esquema `zod`. Llama `login()` del store y navega a `/`. Tiene credenciales precargadas (`hincha@prode.ar`). |
| `/` | `HomeView` | Hero con CTA, "En vivo ahora" si hay un partido `status === "live"`, próximos 3 `scheduled` y 3 quick actions hacia las otras secciones. |
| `/reglas` | `ReglasView` | Listado de `rules` con `RuleCard` + `PrizeCard` (CTA → leaderboard). |
| `/grupos` | `GruposView` | Tabs A/B/C/D (estado en `ui.store`) renderizando `GroupMatchCard` con `ScoreInput` por partido. Footer sticky con CTA "Guardar Predicciones". |
| `/eliminatorias` | `EliminatoriasView` | Bracket en 3 columnas: Octavos / Cuartos / Semis+Final, usando `BracketNode`. Slot vacíos cuando el cruce aún depende de partidos previos. |
| `/leaderboard` | `LeaderboardView` | Card del líder + lista de `LeaderboardRow` con tendencias (`up/down/same`) y resaltado del usuario actual. |
| `/perfil` | `PerfilView` | `ProfileHero` + tarjeta de estadísticas (`count / total` de predicciones, aciertos, exactos) + historial reciente o empty state. |

---

## 9. Patrones recurrentes

- **Alias de imports:** `@/...` apunta a `src/...` (configurado en `tsconfig.app.json` + `vite.config.ts`).
- **Composición shadcn:** se usan los `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `Button`, `Badge`, `Tabs*`, `Avatar*`, `Input`, `Label`, etc., sin reinventarlos.
- **`cn()`** (`src/lib/utils.ts`) en todos lados para mezclar clases condicionales.
- **Selectores de Zustand** con suscripciones finas (`useUiStore(s => s.activeGroup)`) para evitar renders innecesarios.
- **Persistencia silenciosa**: cualquier pronóstico cargado en `ScoreInput` queda en `localStorage` automáticamente.

---

## 10. Estado actual / pendientes obvios

- ✅ Layout completo (desktop + mobile) y navegación.
- ✅ 7 vistas funcionando con datos mock.
- ✅ Sistema de pronósticos local (input → store → localStorage).
- ⏳ Sin conexión real al backend: `@supabase/supabase-js` y `@tanstack/react-query` están instalados pero no se usan en `src/`.
- ⏳ Hay una Edge Function `supabase/functions/sync-results/index.ts` (Deno) que sería el punto de entrada para sincronizar resultados reales; el frontend todavía no la consume.
- ⏳ `src/types/` está vacío — los tipos de dominio viven dentro de cada archivo de `data/` o `stores/`.
- ⏳ El login es 100% simulado y siempre autentica.
- ⏳ Los botones "Guardar Predicciones" / "Guardar Prode" todavía no disparan acciones (los pronósticos ya se persisten al tipear).
