# Reading Shelf

Track your books and reading progress — a real, buildable app you fork on
[hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud.

Keep the books you’re **reading**, **want to read**, and have **finished** on a
cozy library shelf. Every book is a hardcover spine standing on a wooden ledge;
open one to update its progress, change its shelf, or jot notes. Sign in with
Hanzo and your library is scoped to you — no one else’s org can see it.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. 100% gui primitives, no Tailwind, no
  second kit — book-spine cards, a warm serif wordmark, and a parchment library.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. Your `books` are a real Base collection
  provisioned straight from [`schema.sql`](./schema.sql).

## The three views

- **Shelf grid** — books grouped into Currently Reading, Want to Read, and
  Finished shelves, filterable by status. Each book is a coloured spine with its
  title running down it and a progress rail while you’re reading.
- **Book detail** — a cover treatment plus editable shelf (status), progress
  (steppers + quick sets + “Mark finished”), and freeform notes. Save or remove.
- **Add book** — shelve a new title with author, starting shelf, and notes.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy’s `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |
| `VITE_HANZO_API_URL` / `VITE_HANZO_API_KEY` | Optional — only if the app calls the Hanzo LLM gateway. Unused here; never commit a real key. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. The client id defaults to `hanzo-app` and can be overridden with
`VITE_HANZO_CLIENT_ID`.

The one deploy requirement: the IAM client must list this origin’s
`/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every forked
app works, or register a dedicated `hanzo-<app>` client per template.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app’s `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller’s org (`@request.auth.org_id =
org`). At runtime the views read/write the `books` collection through
`@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token. Keep
`schema.sql` in lockstep with `src/lib/shelf.ts`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx            entry
  providers.tsx       GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx             route (/auth/callback) + auth gate
  gui.config.ts       createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts       IAM PKCE config
  env.ts              the VITE_ env contract, one place
  lib/base.ts         BaseClient carrying the IAM bearer token
  lib/shelf.ts        Book shape, statuses, palette, spine colours, sample
  components/library.tsx  the design kit: Spine, Shelf, Panel, Chip, Btn, …
  auth/callback.tsx   PKCE return leg
  views/              signed-out · home · shelf (grid) · book-detail · add-book
schema.sql            databaseSchema -> Base `books` collection on publish
hanzo.yml             Hanzo Cloud build/deploy manifest
```
