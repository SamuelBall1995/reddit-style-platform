# reddit-style-platform

## Overview

A minimal Reddit-style app with:

- Users CRUD

- Posts CRUD per user

- “Posts over time” chart (stacked by user) - Apexcharts (client-only)

- Tailwind v4 + shadcn/ui styling

- Next.js App Router with Server Actions

- Prisma + SQLite (dev) with a seed script

## Data Layer (Prisma)

- ```prisma/schema.prisma```
  - Models: ```User```, ```Post``` with a 1-to-Many relation
  - ```onDelete: Cascade``` on ```Post.author``` so deleting a user cleans up posts too (Ideally, to make it similar to reddit, the user would be deleted and the posts would remain with a tag reading "Deleted User", could iterate over the posts and set the relation field to ```null``` and then delete the user, but that needs more time to do)
  - Why Prisma? Fast local iterations, type-safe queries, one-line easy migrations.
- ```lib/db.ts```
  - Singleton Prisma client so it doesnt create crazy amounts of connections due to next.js hot-reloading while devving
- ```prisma/seed.ts```
  - Deterministic "random" users = Just asked Chatgippidy for for a seed file that follows the prisma schema I made up.

## Validation & Forms
- ```lib/validation.ts```
  - ```UserSchema``` and ```PostSchema``` (Zod)
  - Why Zod? single source of truth for input shapes, its used for both the client stuff (RHF) and for the server (server actions)
- ```components/UserForm.tsx```, ```components/PostForm.tsx```
  - React Hook Form + ```zodResolver``` for fast forms
  - Shows both the client-side errors and server-side errors return by the actions
  - Why React Hook Form? Minimal re-renders, simple API, works well with shadcn input components

## Backend (Next.js Server Actions)
- ```app/users/actions.ts```
  - ```createUser```, ```deleteUser``` (transaction deletes posts first or relies on cascade)
  - Calls ```revalidatePath(`/users`)``` to refresh data after the mutations
- ```app/users/[id]/actions.ts```
  - ```createPost```,```updatePost```, ```deletePost```; revalidates both ```/users/[id]``` and ```/users``` for the chart
- Why Server Actions:
  - Fastest option for this. (Dont have to write/test extra fetch boilerplate, no client data libs).
  - Still enforces server-side validation.
- Next will complain about event handlers if you dont bind the actions correctly (dont wrap with any arrow function etc.) Something I hit and wasnt aware of with server actions and had to rectify on the fly. ```action.bind(null, user.id)```

## Routing & Pages
- ```app/users/page.tsx```
  - Server component: fetches users (with ```_count.posts```), builds chart data
    - ```categories``` + per_user series, renders Cards:
      - Chart (Apexcharts)
      - "Add user" form
      - Users list (with View/Delete)
- ```app/users/[id]/page.tsx```
  - Dynamic Route; awaits ```params``` (Next being a rascal with their async params) and renders:
    - Back button
    - User header
    - Create post form
    - Posts list with inline edit/delete
- Why App Router:
  - File-system routing, colocation of server code with the UI, easy data fetching in server components

## Charts
- ```components/charts/PostsOverTimeApex.tsx```
  - Client-only (via ```next/dynamic```) line chart
  - tried with recharts to start with and it was causing me issues, like it has in the past, to do with SSR and keys that might contain spaces and accents (names of Users, however I switched from a stacked area chart showing posts per user over time, but thought that was silly scalability wise, so I changed it to a line chart. In the end, couldve used recharts just fine, but hey ho), ended up switching to Apexcharts, which is just way easier to setup imo.
  - confined all the tooltips with ```overflow-hidden``` so they dont block clicks below them.

## UI & Styling
- Tailwind (v4): ```app/globals.css```
  - ```@import "tailwindcss";```, ```@theme inline``` tokens, light/dark HSL palette + chart colors
- shadcn/ui components used:
  - havent used shadcn before, was surprised at how nice it is and how customisable it is. Similar to MUI, but just more expansive
  - great for a polished look quickly and has tailwind classes ready to go out of the box.
- ```components/AppHeader.tsx```
  - Just a simple topbar with a brand link and "Users" nav, doesnt really do anything, but leaves things open for further customisation, more pages etc.

## Why each piece of tech?
- Next.js: it was asked for for this task, and it was fun getting my hands into it more. Havent used it much recently, but I want to learn and use it more.
- Prisma/SQLite: zero-infrastructure local database, type-safe queries and easy to swap to postgres later by switching out to API Routes/axios/react fetch etc and some kinda standalone backend, like Django/Fast/Go etc.
- Zod + RHF: shared validation schema, good forms, instant client errors and safe server fallback. In a more prod based system, I would probably switch to something a bit more robust like Formik + Yup, however Zod + RHF is awesome with Next.js in this configuration so id only switch to Formik + Yup if we were to split the front+back. I wanna look more into this though and see if its even necessary with Next.js
- Apexcharts: robust chart lib that doesnt have as much SSR friction as recharts in this case. Still client-only, so the refresh can be kinda jarring, could have a ghost chart that is SSR to sit in its place while its rendering, maybe let the chart take a little time longer to render using some added deadtime so that itself isnt jarring.
- Tailwind v4 + shadcn: Its asked for and they work well together.


# Production Plan (What id do differently if this was a full project)

## Architecture
- Completely separate the backend and the frontend (separate the API from the Next.js app):
  - Run a dedicated API service (in Node/Django/Fast/Go etc.) exposing versioned REST or GraphQL
  - Keep the Next.js app as a pure frontend that consumes that API.
  - Benefits:
    - independent deploys (backend/frontend)
    - API stays up during frontend deploys
    - scaling per layer
    - clearer ownership, although I think this isnt as much of an issue in a full stack team, but perhaps in a team that has dedicated backend and frontend engineers
    - clearer versioning between the backend and frontend
    - access to rate limiting and throttling, by making use of Redis and PostgreSQL
    - reduces bundle size to the client

- Database
  - PostgreSQL managed (Supabase/Neon) instead of SQLite
  - Add indexes: ```Post(authorId, createdAt)```, ```User(email)```
  - Use Prisma Migrate in CI/CD; review migrations; enforce ```onDelete``` constrants deliverately (Cascade vs Restrict)

- Caching
  - CDN for static assets (Next automatically)
  - API GETs: HTTP cache (ETags), CDN, or edge cache
  - Expensive Analytics: Redis caching with tags/TTL; optionally pre-compute daily buckets via a job
- Background jobs
  - Use a queue (inngest, BullMQ, Cloud Tasks) for heavy work: analytics rollups, email, webhooks
- Auth & Security
  - Auth.js (NextAuth) or provider (Auth0/Cognito) with JWT sessions.
  - RBAC/permissions for admin vs normal users.
  - Rate limiting (e.g. Upstash/Redis), input validation at the API boundary (Zod on server), output filtering
  - CORS configured at the API; CSRF for cookie-based flows
  - Secrets via a Secrets Manager (not ```.env``` on disk)
- Observability
  - Sentry for errors, OpenTelemetry tracing, structured logs (Pino) -> ship to Datadog/Grafana.
  - Health checks, readiness probes; dashboards + alerts (latency, error rate, saturation)
- Resilience & deploys
  - Zero-downtime deploys (rolling/blue-green)
  - DB backups + PITR; DR runbooks
  - idempotent mutations; request dedup keys for retries
- Client data fetching
  - If API is separate, prefere TanStack Query (react query?) for caching, retries, mutations, over Server Actions
  - Keep forms with RHF or formik/yup and add updates where sensible.
- Testing
  - Unit(Vitest), integration (spin up a Postgres test db), e2e (Playwright)
  - Contract tests for the API (OpenAPI validation)
  - Seed fixtures per test; snapshot chart data shaping.
  - Swagger
- CI/CD
  - PR checks: typecheck, lint, tests, build
  - Preview deploys for the frontend
  - Migrate + health-gate in prod deploy workflow
- Docs & versioning
  - REST with OpenAPI or GraphQL SDL; human docs + examples
  - Version API (```/v1```) and migrations for breaking changes
  - Swagger


  Prod note (how I’d do totals at scale)

In Postgres: SELECT date_trunc('day', created_at) AS day, COUNT(*) FROM posts GROUP BY 1 ORDER BY 1;

Add index on (created_at).

Cache hot windows (e.g., last 90 days) in Redis with a short TTL or materialize daily rolls with a background job.