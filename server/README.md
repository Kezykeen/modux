# Modux API

Standalone Node backend for Modux (auth, collections, cart, orders). No imports from the Vite frontend — types are duplicated intentionally.

## Stack

- **Fastify** — HTTP server
- **Prisma** — PostgreSQL ORM
- **Better Auth** — email/password sessions (httpOnly cookies)
- **Zod** — env + request validation

## Setup

### Option A — Local Postgres (Docker, recommended for dev)

1. Copy env and start the database:

```bash
cd server
cp .env.example .env
# Edit .env: set BETTER_AUTH_SECRET (openssl rand -base64 32)
npm run db:up          # starts Postgres on localhost:5432
```

2. Install, migrate, run:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Default `DATABASE_URL` in `.env.example` matches the Docker Compose credentials (`modux` / `modux`).

### Option B — Neon (cloud Postgres)

If Neon is reachable, create a free database at [console.neon.tech](https://console.neon.tech) (not always the same as neon.com), paste the connection string into `DATABASE_URL`, then migrate.

### Option C — Homebrew Postgres (no Docker, no Neon)

```bash
brew install postgresql@16
brew services start postgresql@16
createdb modux
```

In `.env`:

```
DATABASE_URL=postgresql://localhost:5432/modux
```

On macOS, Homebrew Postgres usually trusts your user account locally (no password). Then:

```bash
npm run db:migrate
npm run dev
```

### Env checklist

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `postgresql://modux:modux@localhost:5432/modux` or Neon URL |
| `BETTER_AUTH_SECRET` | 32+ char random string (required) |
| `BETTER_AUTH_URL` | `http://localhost:3001` |
| `CLIENT_ORIGIN` | `http://localhost:5173` |

Health check: `GET http://localhost:3001/health`

## Auth (Better Auth)

All auth routes are under `/api/auth/*` (sign-up, sign-in, sign-out, session).

From the browser, call with cookies:

```ts
fetch('http://localhost:3001/api/auth/sign-in/email', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
```

### Forgot password

- Request reset: Better Auth client `requestPasswordReset` with `redirectTo: http://localhost:5173/reset-password`
- In **development**, the reset link is printed to the API server console (no email provider wired yet)
- User lands on `/reset-password?token=…` and sets a new password

For production, replace `sendResetPassword` in `src/lib/auth.ts` with Resend, SendGrid, etc.

## REST API (session required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/collections` | List saved builds |
| POST | `/api/collections` | Save a build |
| DELETE | `/api/collections/:id` | Remove a collection |
| GET | `/api/cart` | Current cart + totals |
| PUT | `/api/cart` | Replace cart contents |
| GET | `/api/orders` | Order history |
| GET | `/api/orders/:id` | Single order |
| POST | `/api/orders` | Place order from cart |

## Deploy

- Build: `npm run build && npm start`
- Set production `BETTER_AUTH_URL`, `CLIENT_ORIGIN`, `DATABASE_URL`
- Use the same Docker image on Render / Fly — only env vars change

## Snapshots (build preview images)

Preview JPEGs are uploaded to object storage — **not** `localStorage`.

| `STORAGE_DRIVER` | Use case |
|------------------|----------|
| `local` (default) | Dev: files in `server/data/uploads/` |
| `s3` | Production: Neon Object Storage, Cloudflare R2, or AWS S3 |

**API**

- `POST /api/uploads/snapshot` — `{ image: "data:image/jpeg;base64,..." }` → `{ snapshotKey, url }`
- `GET /api/assets/snapshots/:userId/:file` — serves image (session required, own files only)

**Neon Object Storage:** enable buckets in Neon, set `STORAGE_DRIVER=s3` and S3-compatible credentials. Optionally set `ASSETS_PUBLIC_URL` to the bucket’s public URL so images load without proxying through the API.

Cart, collection, and order records store `snapshotKey`; API responses include `snapshotUrl`.
