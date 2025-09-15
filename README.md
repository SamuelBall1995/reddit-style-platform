## Overview

A minimal Reddit-style app with:

- Users CRUD

- Posts CRUD per user

- “Posts over time” chart - Apexcharts (client-only)

- Tailwind v4 + shadcn/ui styling

- Next.js App Router with Server Actions

- Prisma + SQLite (dev) with a seed script


### Pre-reqs:
  - Node.js: 20+
  - npm: 10+

### .env file
  - Dev database (SQLite)
  - ```DATABASE_URL="file:./dev.db"```

### migrate and seed db
  - npx prisma migrate dev --name init
  - npx prisma db seed
    - if theres an issue when deleting users make sure the onDelete migration has been applied, if not:
    - npx prisma migrate dev --name cascade-delete-posts

### Run
  - npm run dev

### Quick tour:
  - /app/ – Next.js App Router pages & server actions
  - app/users/page.tsx – users list + ApexCharts + “Add user”
  - app/users/actions.ts – create/delete user (revalidates paths)
  - app/users/[id]/page.tsx – user detail with posts CRUD
  - app/users/[id]/actions.ts – create/update/delete post
  - /components/ – UI components (forms, lists, chart wrappers, header)
  - /components/ui/ – shadcn/ui primitives (Button, Card, etc.)
  - /components/charts/ – ApexCharts(and recharts) client component(s)
  - /lib/db.ts – Prisma client singleton
  - /lib/validation.ts – Zod schemas for Users & Posts
  - /prisma/schema.prisma – Prisma models (User, Post with onDelete: Cascade)
  - /prisma/seed.ts – mock data generator (users + posts over recent days)
  - /app/globals.css – Tailwind v4 tokens/theme + utilities

### Other scripts
  - If you need to reset the db and reseed after testing deletes etc.
    - npx prisma migrate reset -f

### Dependencies
  - next, react, react-dom
  - tailwindcss@v4
  - shadcn/ui
  - prisma + @prisma/client
  - zod, react-hook-form, @hookform/resolvers
  - apexcharts, react-apexcharts, (and recharts)
  - lucide-react for icons