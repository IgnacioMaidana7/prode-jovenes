# Migración a Supabase — Resumen y checklist

Documento que resume **qué se cambió en el frontend** para conectar la SPA a Supabase, y **qué te queda por hacer vos** para que la app levante y funcione end-to-end.

---

## 1. TL;DR

- Toda la capa de datos pasó de mock estático (`src/data/*`) a Supabase via **TanStack Query v5** + cliente tipado.
- **Auth real** con `supabase.auth.signInWithPassword` / `signUp` / `signOut` + `onAuthStateChange`.
- **Pronósticos** se guardan con `upsert` + optimistic update + guard de kickoff.
- **Leaderboard** lee las vistas `ranking_global` y `ranking_by_group`.
- `tsc -b` y `npm run lint` pasan limpios (0 errores, 0 warnings).
- **No** se tocaron componentes de `src/components/ui/*`, ni clases CSS, ni el theme.

---

## 2. Archivos NUEVOS

| Archivo | Qué hace |
|---|---|
| `src/lib/supabase.ts` | Crea el cliente Supabase tipado con `Database`. Valida `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Persiste sesión en `localStorage` (clave `prode.supabase.auth`). |
| `src/types/index.ts` | Tipos de dominio (`Fixture`, `Prediction`, `Profile`, `Group`, `GroupMember`, `LeaderboardEntry`, `GroupLeaderboardEntry`, `AuthUser`) + `Database` para `createClient<Database>`. Incluye `Relationships: []` y `CompositeTypes` (requerido por `supabase-js` v2 para que `.upsert()` no infiera `never`). |
| `src/hooks/useFixtures.ts` | `useFixtures()` + `useUpcomingMatches(limit)` + `useFixturesByGroup(g)` + `useFixturesByStage(s)` + `useFixtureById(id)`. Exporta `fixturesQuery` (queryOptions) para precarga / `fetchQuery` desde mutations. |
| `src/hooks/usePredictions.ts` | `usePredictions()` (lista + map por fixture + `count`), `usePrediction(id)`, `useSavePrediction()` (mutation con **upsert**, **optimistic update**, **rollback en error**, **guard de kickoff**, **toast** vía sonner). |
| `src/hooks/useLeaderboard.ts` | `useGlobalLeaderboard()`, `useGroupLeaderboard(groupId)`, `useCurrentUserStats()` (deriva `points`, `rank`, `exactHits`, `winnerHits`, `predictionsCount` del usuario logueado). |

---

## 3. Archivos REFACTORIZADOS

### Stores
| Archivo | Cambios |
|---|---|
| `src/stores/auth.store.ts` | **Reescrito a Supabase Auth.** Acciones: `initialize`, `login`, `register(email, password, username)`, `logout`, `refreshProfile`. Listener `onAuthStateChange` idempotente. El tipo `User` ahora es `{ id, email, username, avatarUrl }` (los puntos/rank vienen del leaderboard, no del auth). |
| `src/stores/ui.store.ts` | `activeGroup` ahora es `string` (antes era `"A"\|"B"\|"C"\|"D"`). Se quitó el import de `GroupId` desde data mock. |

### Router / shell
| Archivo | Cambios |
|---|---|
| `src/App.tsx` | Agrega `QueryClientProvider`, `ProtectedRoute` con redirect a `/login`, y un bootstrap `initialize()` que corre antes de montar el router. Muestra un loader minimal mientras inicializa. |

### Vistas
| Archivo | Cambios |
|---|---|
| `src/views/LoginView.tsx` | Login real + signup con toggle entre modos. Errores vía `toast.error`. Sin credenciales precargadas. |
| `src/views/HomeView.tsx` | `useFixtures()` + `useUpcomingMatches(3)`. Skeletons mientras carga. Muestra resultado en vivo. |
| `src/views/GruposView.tsx` | `useFixtures()` (deriva grupos de la columna `group_name`) + `usePredictions()`. Sin `setState` en effects (derivación pura del grupo efectivo). |
| `src/views/EliminatoriasView.tsx` | Bracket dinámico armado a partir de fixtures con `stage !== "GROUP"`. Skeleton + estado vacío. |
| `src/views/LeaderboardView.tsx` | `useGlobalLeaderboard()` + `useCurrentUserStats()`. Marca el row del usuario actual. |
| `src/views/PerfilView.tsx` | Predicciones reales con historial (últimas 5) y stats en vivo del leaderboard. Badge de puntos por predicción. |

### Componentes de dominio (`components/prode/*`)
| Archivo | Cambios |
|---|---|
| `GroupMatchCard.tsx` | Recibe `match: Fixture` directo (lee `team_home/team_away/flag_home/flag_away/result_*/status`). Soporta estado `FINISHED` mostrando el resultado real. |
| `BracketNode.tsx` | Igual: recibe `Fixture`. Mapeo de `stage` a label visible (Octavos / Cuartos / Semis / Final / 3er Puesto). |
| `ScoreInput.tsx` | Cambio importante: ahora usa **inputs no controlados + `key`-reset + commit on blur/Enter**, sin `useEffect` que setee estado (alineado con React 19). Bloquea edición cuando el partido ya empezó (`isEditable(fixture)`). Dispara la mutation contra Supabase. |
| `LeaderboardRow.tsx` | Acepta `LeaderboardEntry` real (sin `trend`/`trendDelta` mock). Muestra `predictions_count` y `exact_hits`. Soporta `avatar_url` (vía `AvatarImage`). Recibe `isCurrentUser` como prop. |
| `ProfileHero.tsx` | Stats derivadas de `useCurrentUserStats()`. Logout async con manejo de error vía toast. Badges se muestran condicionalmente según haya datos. |

### Layout
| Archivo | Cambios |
|---|---|
| `Sidebar.tsx` | Puntos del usuario salen de `useCurrentUserStats()`. Logout async con toast en error. |
| `TopBar.tsx` | Badge de notificaciones lee `usePredictions().count` (antes leía del store local). |

---

## 4. Archivos NO TOCADOS

- Todos los `src/components/ui/*` (shadcn primitives).
- `src/components/prode/BrandLogo.tsx`, `LiveBadge.tsx`, `RuleCard.tsx`, `PrizeCard.tsx`.
- `src/components/layout/AppShell.tsx`, `MobileBottomNav.tsx`.
- `src/lib/utils.ts`, `format.ts`, `motion.ts`, `flags.tsx`.
- `src/hooks/use-store.ts`, `use-reduced-motion.ts`.
- `src/index.css`, `src/main.tsx`, `vite.config.ts`, configs varios.
- `src/data/rules.ts` y `src/views/ReglasView.tsx` (los reglamentos son contenido estático).

---

## 5. Archivos OBSOLETOS (los dejé por “mantener estructura de carpetas”)

Estos archivos ya no se importan desde ningún lado. Podés borrarlos cuando quieras:

- `src/data/teams.ts`
- `src/data/groups.ts`
- `src/data/matches.ts`
- `src/data/leaderboard.ts`
- `src/stores/predictions.store.ts` (el estado de predicciones vive ahora en el cache de TanStack Query)

> `src/stores/index.ts` re-exporta `predictions.store`. Si borrás el archivo, sacá también esa línea.

---

## 6. Lo que te queda por configurar

### 6.1 Variables de entorno (obligatorio)
Creá un archivo **`.env`** en la raíz del proyecto:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> Si no están seteadas, `src/lib/supabase.ts` tira error claro al cargar.
> Reiniciá `vite` después de crear el `.env`.

Sumá `.env` y `.env.local` al `.gitignore` (chequealo).

### 6.2 Tablas que tienen que existir en Supabase

```sql
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text
);

-- fixtures
create type public.fixture_stage as enum ('GROUP','R16','QF','SF','F','3RD');
create type public.fixture_status as enum (
  'SCHEDULED','TIMED','IN_PLAY','PAUSED','LIVE','FINISHED',
  'POSTPONED','SUSPENDED','CANCELLED'
);

create table public.fixtures (
  id uuid primary key default gen_random_uuid(),
  external_id bigint unique,
  stage public.fixture_stage not null,
  group_name text,
  team_home text,
  team_away text,
  flag_home text,
  flag_away text,
  date timestamptz not null,
  result_home int,
  result_away int,
  status public.fixture_status not null default 'SCHEDULED'
);

-- predictions
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  pred_home int not null check (pred_home between 0 and 99),
  pred_away int not null check (pred_away between 0 and 99),
  points int,
  created_at timestamptz not null default now(),
  unique (user_id, fixture_id)   -- requerido por el onConflict del upsert
);

-- groups y group_members (futuro, no se usan todavía en el frontend)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade
);

create table public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  primary key (group_id, user_id)
);
```

> **Importante:** el frontend asume `UNIQUE(user_id, fixture_id)` en `predictions` para que el `.upsert(..., { onConflict: "user_id,fixture_id" })` funcione.

### 6.3 Vistas de ranking

El frontend espera exactamente estas columnas:

```sql
-- ranking_global
create or replace view public.ranking_global as
select
  p.user_id,
  pr.username,
  pr.avatar_url,
  coalesce(sum(p.points), 0)::int            as total_points,
  count(*) filter (where p.points = 3)::int  as exact_hits,
  count(*) filter (where p.points = 1)::int  as winner_hits,
  count(*)::int                              as predictions_count,
  rank() over (order by coalesce(sum(p.points),0) desc)::int as rank
from public.predictions p
join public.profiles pr on pr.id = p.user_id
group by p.user_id, pr.username, pr.avatar_url;

-- ranking_by_group
create or replace view public.ranking_by_group as
select
  gm.group_id,
  p.user_id,
  pr.username,
  pr.avatar_url,
  coalesce(sum(p.points), 0)::int            as total_points,
  count(*) filter (where p.points = 3)::int  as exact_hits,
  count(*) filter (where p.points = 1)::int  as winner_hits,
  count(*)::int                              as predictions_count,
  rank() over (
    partition by gm.group_id
    order by coalesce(sum(p.points),0) desc
  )::int                                     as rank
from public.predictions p
join public.profiles      pr on pr.id = p.user_id
join public.group_members gm on gm.user_id = p.user_id
group by gm.group_id, p.user_id, pr.username, pr.avatar_url;
```

> **Si tus columnas se llaman distinto** (por ejemplo `points` en lugar de `total_points`, `position` en lugar de `rank`, etc.), avisame los nombres y ajusto:
> - `LeaderboardEntry` / `GroupLeaderboardEntry` en `src/types/index.ts`
> - `LeaderboardRow.tsx`, `useLeaderboard.ts`, `ProfileHero.tsx`

### 6.4 Trigger de puntos

El frontend asume que `predictions.points` se calcula en la DB cuando se llena `fixtures.result_home/away`. Sugerencia de implementación:

```sql
create or replace function public.calc_prediction_points(
  pred_h int, pred_a int, real_h int, real_a int
) returns int language sql immutable as $$
  select case
    when real_h is null or real_a is null then null
    when pred_h = real_h and pred_a = real_a then 3      -- exacto
    when sign(pred_h - pred_a) = sign(real_h - real_a) then 1  -- ganador/empate
    else 0
  end;
$$;

create or replace function public.update_points_for_fixture()
returns trigger language plpgsql as $$
begin
  if new.result_home is distinct from old.result_home
     or new.result_away is distinct from old.result_away then
    update public.predictions
       set points = public.calc_prediction_points(
         pred_home, pred_away, new.result_home, new.result_away
       )
     where fixture_id = new.id;
  end if;
  return new;
end;
$$;

create trigger trg_update_points
after update on public.fixtures
for each row execute function public.update_points_for_fixture();
```

### 6.5 Row Level Security (RLS)

**Sin estas policies, las queries del frontend van a fallar con 0 filas / errores.**

```sql
-- profiles: lectura pública, escritura solo dueño
alter table public.profiles enable row level security;
create policy "profiles_read_all"   on public.profiles for select using (true);
create policy "profiles_upsert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- fixtures: lectura pública (solo escribe la Edge Function con service role)
alter table public.fixtures enable row level security;
create policy "fixtures_read_all" on public.fixtures for select using (true);

-- predictions: cada uno ve y modifica las suyas
alter table public.predictions enable row level security;
create policy "predictions_read_own"   on public.predictions for select using (auth.uid() = user_id);
create policy "predictions_insert_own" on public.predictions for insert with check (auth.uid() = user_id);
create policy "predictions_update_own" on public.predictions for update using (auth.uid() = user_id);

-- vistas: heredan RLS de las tablas base; ranking_global debería verse igual
-- si querés que el ranking_global liste a todos, las predictions
-- necesitarían un policy de read_all, o materializás la vista, o usás
-- una función SECURITY DEFINER que la calcule.
```

> ⚠️ **Caveat importante con el leaderboard:** la vista `ranking_global` agrega `predictions`. Si tenés RLS estricto sobre `predictions` (solo el dueño ve las suyas), la vista va a devolver solo TUS puntos, no los de los demás.
>
> Soluciones posibles:
> 1. Agregar policy `select` público sobre `predictions` (más simple, pero expone los pronósticos individuales de todos).
> 2. Convertir `ranking_global` y `ranking_by_group` en **vistas materializadas** refrescadas por el trigger / cron, y darles SELECT público.
> 3. Convertirlas en funciones `SECURITY DEFINER` que ignoren RLS.

Elegí una antes de pasar a producción.

### 6.6 Profile auto-creado en signup

El `register()` de `auth.store.ts` ya hace `upsert` en `profiles` después del `signUp`, pero **si el usuario tiene que confirmar el email primero**, `data.user` puede llegar sin `session` y conviene tener también un trigger por las dudas:

```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    null
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

### 6.7 Settings de Auth en el dashboard de Supabase

- **Email confirmations**: si las dejás activadas, el `signUp` del frontend va a crear el usuario pero NO va a iniciar sesión hasta que confirme el email. El toast muestra un mensaje genérico — ajustalo si querés algo más explícito.
- **Site URL** y **Redirect URLs**: agregá `http://localhost:5173` para dev y la URL de prod.
- Si vas a usar OAuth (Google/GitHub), el frontend actual **no** tiene UI para eso todavía. Avisame y lo sumo.

### 6.8 Edge Function `sync-results`

Ya está en `supabase/functions/sync-results/index.ts`. Para deployarla:

```bash
supabase functions deploy sync-results
supabase secrets set FOOTBALL_API_KEY=xxx
```

Después seteala como cron (cada 5–15 minutos) desde el dashboard o:
```bash
supabase functions schedule create sync-results --cron "*/10 * * * *"
```

### 6.9 Storage (opcional, para avatares)

El frontend ya soporta `avatar_url` en `profiles` y lo renderiza vía `AvatarImage`. Si querés permitir subir avatares:

1. Crear bucket `avatars` con acceso público de lectura.
2. Agregar una UI de upload en `PerfilView` (no está hecho todavía).
3. Guardar la URL pública en `profiles.avatar_url`.

---

## 7. Supuestos del frontend que conviene confirmar

| Asumido | Si tu schema es distinto, decime |
|---|---|
| `fixtures.stage` usa los valores `GROUP \| R16 \| QF \| SF \| F \| 3RD` | Si usás `'group'`, `'round_of_16'`, etc., ajusto `FixtureStage` y los filtros |
| `fixtures.status` usa los códigos de football-data.org | Coincide con el `sync-results` actual |
| Vistas devuelven `user_id, username, avatar_url, total_points, exact_hits, winner_hits, predictions_count, rank` (+ `group_id` en `ranking_by_group`) | Si los nombres son otros, ajusto en un solo paso |
| `predictions` tiene `UNIQUE(user_id, fixture_id)` | Necesario para el `upsert` con `onConflict` |
| Sistema de puntos: **3 exacto, 1 ganador/empate** | Si cambia, ajusto las cotas de `badgeVariant` en `PerfilView.tsx` |
| `fixtures.flag_home/flag_away` son códigos ISO-2 (ej. `"AR"`, `"BR"`) | El componente `<Flag/>` convierte 2 chars → emoji 🇦🇷 |
| `fixtures.date` es ISO timestamp con timezone | `date-fns` parsea sin problemas |

---

## 8. Cómo probar localmente

```bash
# 1. dependencias
npm install

# 2. variables de entorno (ver §6.1)
copy .env.example .env  # o create manualmente
# editá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 3. verificar
npx tsc -b           # debe pasar sin output
npm run lint         # debe pasar sin output

# 4. dev server
npm run dev
```

Flujo mínimo de smoke test:
1. Ir a `/login` → registrarte con un email/usuario nuevo.
2. Confirmar email si lo tenés activado.
3. Loguearte → te redirige a `/`.
4. Verificar que `/grupos` carga los fixtures de la DB.
5. Tipear un score y salir del input → debería aparecer toast “Pronóstico guardado”.
6. Refrescar página → el pronóstico debería persistir.
7. Ir a `/leaderboard` → te debería listar (con 0 puntos hasta que algún partido termine).

---

## 9. Limitaciones / TODOs sugeridos (post-MVP)

- **No hay registro con OAuth** (Google/GitHub). Solo email + password.
- **No hay UI para “Olvidé mi contraseña”** (el link existe pero apunta a `#`).
- **No hay UI para crear/unirse a `groups`** (las tablas están pero el frontend todavía no las consume; el ranking actual es global).
- **No hay subida de avatar** (el componente lo renderiza si existe, pero no hay form para setearlo).
- **No hay confirmación visual** de que un partido ya empezó más allá del estado readonly del input + el badge.
- **No hay realtime**: el leaderboard se refresca al volver a la página. Si querés live updates: `supabase.channel(...)` + invalidar las queries de TanStack.
- **El badge de “notificaciones”** del `TopBar` muestra la cantidad total de pronósticos cargados, no notificaciones reales.

---

## 10. Decisiones técnicas notables

- **TanStack Query como única fuente de verdad** para fixtures, predictions y leaderboard. Zustand quedó solo para sesión (auth) y UI state liviano (tab activo de grupos).
- **Inputs no controlados** en `ScoreInput` (`defaultValue` + `key`-reset) para cumplir con el lint de React 19 (`react-hooks/set-state-in-effect`) y evitar re-renders en cada tecla.
- **Snapshot de `Date.now()`** en `useUpcomingMatches` via `useState(() => Date.now())` para cumplir con `react-hooks/purity`.
- **Optimistic updates con rollback** en `useSavePrediction` para que el score se vea instantáneo aunque el `upsert` tarde.
- **Guard de kickoff** se valida tanto en el cliente (deshabilita inputs) como dentro de la mutation (vuelve a chequear contra el cache de fixtures antes de pegarle a Supabase).
- **`Database` con `Relationships: []` y `CompositeTypes`** porque `supabase-js@2` infiere `never` si faltan esos campos y `.upsert()` deja de tipar.
