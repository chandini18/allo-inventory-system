# Allo Inventory System

A full-stack inventory reservation system built with Next.js, Prisma, and Supabase (PostgreSQL).

## Live Demo

[https://allo-inventory-system-rho.vercel.app](https://allo-inventory-system-rho.vercel.app)

## How to Run Locally

### 1. Clone the repo

\```bash
git clone https://github.com/chandinij18/allo-inventory-system.git
cd allo-inventory-system
\```

### 2. Install dependencies

\```bash
npm install
\```

### 3. Set up environment variables

Create a `.env` file in the root:

\```env
DATABASE_URL="postgresql://postgres.your-ref:YOUR-PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:YOUR-PASSWORD@db.your-ref.supabase.co:5432/postgres"
\```

### 4. Run migrations and seed

\```bash
npx prisma migrate deploy
npx prisma db seed
\```

### 5. Start the dev server

\```bash
npm run dev
\```

Open [http://localhost:3000](http://localhost:3000)

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List products with stock per warehouse |
| POST | /api/reservations | Reserve units — returns 409 if out of stock |
| GET | /api/reservations/:id | Get reservation details |
| POST | /api/reservations/:id/confirm | Confirm reservation — returns 410 if expired |
| POST | /api/reservations/:id/release | Release reservation early |

## Concurrency Safety

The reservation endpoint uses a Prisma `$transaction` to wrap the stock check and update atomically. This prevents race conditions — if two requests arrive simultaneously for the last unit, the database transaction ensures exactly one succeeds and the other gets a 409.

## Expiry Mechanism

Reservations expire after 15 minutes (`expiresAt = now + 15 min`). Expiry is handled via **lazy cleanup on read** — when a confirm request comes in, the API checks if `now > expiresAt` and rejects with 410 if expired, updating the status to `EXPIRED`. The frontend countdown timer makes the expiry visible to the user in real time.

With more time, I would add a Vercel Cron job to periodically release expired reservations and return stock to available inventory automatically.

## Trade-offs and Things I'd Do Differently

- **No idempotency keys** — the bonus feature was not implemented. Would use a Redis-backed idempotency store with Upstash.
- **Lazy expiry** — expired reservations don't auto-release stock until a confirm is attempted. A cron job would handle this properly in production.
- **No authentication** — any user can reserve or confirm any reservation. Would add auth in production.
- **Basic UI** — the frontend is functional but unstyled. Would use Tailwind + shadcn/ui with more time.