# reading-shelf — agent notes

A real Hanzo app you fork on hanzo.app: track the books you're reading, want to
read, and have finished, with progress and notes. Forked from the canonical
`hanzo-starter`, it keeps the exact provider stack, `vite.config`, PKCE auth, and
deploy contract, and varies only the domain, data model, and design.
Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base` (data).
Keep it minimal and REAL — every surface must build and run, no fabricated UI.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; it is rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Domain is one place** (`src/lib/shelf.ts`) — the `Book` shape, the three
  statuses (`reading`/`want`/`finished`), the cozy-library palette, the
  deterministic spine colour, and the sample library for the landing.
- **The look is one kit** (`src/components/library.tsx`) — `Spine` (a hardcover
  standing on a `Shelf` ledge), `Panel`, `StatusPill`, `Chip`, `Btn`,
  `ProgressBar`, `Mark`. Pure presentation, reused by the signed-out sample and
  the signed-in app so both look identical.
- **Views** (`src/views/`): `signed-out` (cozy landing + sample shelf) ·
  `home` (chrome) → `shelf` (`Bookshelf`, the grid) → `book-detail` · `add-book`.
  No router — one static SPA; the grid/detail/add switch on local state.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`.
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **Tamagui LONGHAND props** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`alignSelf`/
  `borderRadius`/`textAlign` — NOT `items`/`justify`/`bg`/`p`/`self`/`rounded`/
  `text`. Shorthands pass at runtime but FAIL `tsc`.
- **`Button` takes no `color` prop, and `placeholderTextColor` only accepts
  design tokens** (not arbitrary hex). So every custom-coloured control is
  composed from `XStack` + `Text` (that is the `Btn` primitive), and `Input`
  drops `placeholderTextColor`. `Input` uses `value`/`onChangeText` and accepts
  `multiline`/`numberOfLines`/`textAlignVertical`.
- **Do NOT wrap content in `@hanzo/gui/linear-gradient` `<LinearGradient>`.**
  Under plain Vite it paints its gradient OVER its children and washes the whole
  view out (looks blank). For a warm background use a plain `YStack` with a CSS
  gradient via `style={{ backgroundImage: 'linear-gradient(...)' }}` — children
  then paint normally on top. (See `signed-out.tsx` / `home.tsx`.)
- **Serif + rotation** both typecheck and render: serif via
  `style={{ fontFamily: SERIF }}` on a `Text`; a book spine's title reads down
  the spine via `rotate="90deg"` on a sized inner stack.
- **PKCE storage is `localStorage`** so the verifier/state survive the round-trip
  to hanzo.id.
- **`schema.sql` is the data contract** — the `databaseSchema` DDL the deploy
  translates into Base collections (`provisionBaseFromDDL`). Keep it in lockstep
  with `src/lib/shelf.ts` and the views (`books(title,author,status,progress,notes)`).

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage (the `*.hanzo.app` published-sites edge). No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `books`
  collection (org-scoped, IAM-native, rule `@request.auth.org_id = org`). Runtime
  read/write is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (a `https://*.hanzo.app/auth/callback` wildcard, or a
  dedicated `hanzo-<app>` client).

## Proven

`tsc --noEmit` clean · `vite build` → `dist/` · the signed-out landing and the
signed-in detail/add forms both render headless (Playwright, 1280×800) with zero
console errors · `login()` performs a real PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
