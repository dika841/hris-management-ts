# Deployment Guide — Cloudflare + Render.com (Free Tier Demo)

This guide covers deploying the HRIS system for demo/staging using **zero-cost**
cloud services.

## Architecture

```
Users
  │
  ▼
Cloudflare Pages ──────────► Static React/Vite SPA
  │ (HTTPS, CDN, free)        (served from edge)
  │
  │ API requests
  ▼
Render.com (free)  ──────────► Node.js Hono API
  │                            (spins down after 15min idle)
  │
  ├── Neon.tech (free)  ──────► PostgreSQL 0.5GB
  ├── Upstash (free)    ──────► Redis (session, rate limit)
  └── Cloudflare R2     ──────► Object Storage (media)
```

> **Note**: Render.com free tier **spins down** after 15 minutes of inactivity.
> First request after spin-down takes ~30s. Use a UptimeRobot ping to keep it warm.

---

## 1. Prerequisites

```bash
# Install wrangler CLI (already available via npx)
npx -y wrangler --version

# Authenticate with Cloudflare
npx wrangler login
```

---

## 2. Cloudflare R2 — Media Storage

### Create the bucket

```bash
# Run the setup script
./scripts/setup-r2.sh

# Or manually:
npx wrangler r2 bucket create hris-media
```

### Apply CORS policy

```bash
npx wrangler r2 bucket cors put hris-media --file docs/cloudflare-r2-cors.json
```

### Get credentials

1. Go to **Cloudflare Dashboard → R2 → Manage R2 API Tokens**
2. Create token: **Object Read & Write** on `hris-media`
3. Copy:
   - `STORAGE_ACCESS_KEY_ID`
   - `STORAGE_SECRET_ACCESS_KEY`
4. Your endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
5. Enable **R2.dev subdomain** in bucket settings for a public URL

---

## 3. Neon.tech — PostgreSQL

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project → note the **pooled connection string**
3. Run migrations:

```bash
# Set env vars first
export DATABASE_URL="postgresql://..."
pnpm --filter @app/api migrate
```

---

## 4. Upstash — Redis

1. Create account at [upstash.com](https://upstash.com)
2. Create a Redis database (region: us-east-1 recommended)
3. Go to **Details → Connect → ioredis** and copy the URL
4. Format: `rediss://default:<token>@<host>.upstash.io:6379`

---

## 5. Email — Resend.com

1. Create account at [resend.com](https://resend.com)
2. Create API key
3. SMTP config:
   - `SMTP_URL=smtps://resend:<API_KEY>@smtp.resend.com:465`
   - `MAIL_FROM=HRIS <no-reply@yourdomain.com>`

> For demo without custom domain, use `onboarding@resend.dev` as sender.

---

## 6. API — Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repository
4. Configure the service:

| Setting | Value |
|---|---|
| **Language** | `Node` |
| **Root Directory** | *(leave blank — must be the monorepo root)* |
| **Build Command** | `pnpm install --frozen-lockfile && pnpm --filter @app/api build` |
| **Start Command** | `pnpm --filter @app/api start` |
| **Health Check Path** | `/healthz` |

> **⚠️ Root Directory must be empty!**
> This is a pnpm monorepo. `pnpm install` must run from the repository root so that
> all workspace packages (`@app/storage`, `@app/cache`, etc.) are resolved correctly.
> If you set root directory to `apps/api`, the build will fail because `pnpm-workspace.yaml`
> won't be found.

5. Set environment variables (copy from `apps/api/.env.cloudflare.example`):

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | Upstash ioredis URL |
| `BETTER_AUTH_URL` | Your Pages URL |
| `BETTER_AUTH_SECRET` | Random 64-char string |
| `WEB_ORIGIN` | Your Pages URL |
| `SMTP_URL` | Resend SMTP |
| `MAIL_FROM` | Email sender |
| `STORAGE_ACCESS_KEY_ID` | R2 API token |
| `STORAGE_SECRET_ACCESS_KEY` | R2 API secret |
| `STORAGE_BUCKET` | `hris-media` |
| `STORAGE_ENDPOINT` | `https://<ID>.r2.cloudflarestorage.com` |
| `STORAGE_PUBLIC_URL` | `https://pub-<hash>.r2.dev` |
| `NODE_ENV` | `production` |
| `METRICS_ENABLED` | `false` |

> `RABBITMQ_URL` is **optional**. Omit it to run in demo mode (background jobs disabled).

---

## 7. Frontend — Cloudflare Pages

### Manual deploy

```bash
# Set your API URL and deploy
VITE_API_URL=https://your-api.onrender.com ./scripts/deploy-frontend.sh --production
```

### Automated via GitHub Actions

Set these **GitHub repository secrets**:

| Secret | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `VITE_API_URL` | Your Render.com API URL |

Then push to `trunk` — the `deploy.yml` workflow will build and deploy automatically.

### First-time Pages project creation

```bash
cd apps/web
pnpm build
# First deploy creates the project automatically
npx wrangler pages deploy dist --project-name=hris-management-web
```

---

## 8. Seed initial data

```bash
# After DB is ready and migrations run:
export DATABASE_URL="postgresql://..."
export SEED_PASSWORD="AdminPassword123!"
pnpm --filter @app/api db:seed
```

---

## 9. Verify deployment

```bash
# Check API health
curl https://your-api.onrender.com/healthz

# Check readiness (DB, Redis connected)
curl https://your-api.onrender.com/ready
```

---

## Cost Breakdown (Free Tiers)

| Service | Free Limit | Expected Usage |
|---|---|---|
| Cloudflare Pages | Unlimited requests, 500 builds/mo | < 50 builds/mo |
| Cloudflare R2 | 10 GB storage, 1M reads, 1M writes/mo | < 1 GB |
| Neon.tech | 0.5 GB storage, 1 compute unit | < 0.1 GB |
| Upstash Redis | 10,000 commands/day | < 5,000/day |
| Render.com | 750 hrs/mo (1 service = free) | 750 hrs |

**Total cost: $0/month** for demo usage.

---

## Troubleshooting

### API not responding (Render cold start)
- Expected: first request after 15min idle takes ~30s
- Fix: Add a free UptimeRobot monitor to ping `/healthz` every 5 minutes

### CORS errors on file upload
- Ensure R2 CORS is applied: `npx wrangler r2 bucket cors put hris-media --file docs/cloudflare-r2-cors.json`
- Ensure `WEB_ORIGIN` in API env matches your Pages URL exactly (no trailing slash)

### `BETTER_AUTH_URL` must be HTTPS in production
- This is enforced by the env schema — use your Pages URL or Render URL
