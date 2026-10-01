# Enterprise HRIS Management System (Indonesia Compliance)

A production-grade, full-stack TypeScript Human Resource Information System (HRIS) engineered specifically for Indonesian employment regulations, taxation, and statutory social security compliance, including automated handling for complex operational edge cases.

Built on a modern TypeScript monorepo adhering to Clean Architecture & Domain-Driven Design (DDD):
- **Backend**: Hono + oRPC (end-to-end typed RPC & OpenAPI) + Effect-TS + Drizzle ORM + PostgreSQL.
- **Frontend**: React 19 + TanStack Router (Dedicated Full-Page Navigation) + TanStack Query + Tailwind CSS v4 + shadcn/ui.
- **Async & Quality**: RabbitMQ + Redis Cache + Biome + Vitest + Playwright.

---

## Core Feature Modules

### 1. Core HR & Contract Lifecycle Management
- **Statutory Compliance (Government Regulation PP 35/2021 & Job Creation Law)**:
  - Management of Fixed-Term Employment Agreements (*PKWT*) and Permanent Agreements (*PKWTT*).
  - Automated tracking of the 5-year maximum legal PKWT accumulation limit with automated early expiration warnings (H-60 and H-30 days).
  - Automated calculation of **PKWT Termination/Extension Compensation**:
    $$\text{Statutory Compensation} = \frac{\text{Tenure (Months)}}{12} \times \text{Monthly Wage}$$
  - Automated validation preventing illegal probationary clauses in PKWT contracts (void by law under Indonesian labor regulations).
- **Organizational Hierarchy & Career History**:
  - Departments, Positions/Job Titles, and Reporting Line (*Reporting Manager*) hierarchy.
  - Job promotions, transfers, and compensation adjustments backed by an audit trail.
- **Personal Data Protection (Indonesian PDP Law No. 27/2022)**:
  - Secure handling and role-restricted access for sensitive identity data (National ID / KIK, NPWP Tax ID, Payroll Bank Account, BPJS Kesehatan & Ketenagakerjaan).
  - Explicit privacy consent audit trail.

### 2. Time & Attendance, Leave, and Overtime
- **Multi-Status Daily Attendance**:
  - Actual working hour tracking, clock-in, clock-out, late minutes, and effective working duration.
  - Attendance classifications: Present, Sick, Permitted, Annual/Special Leave, Absent (*Mangkir*), and Off/Holiday.
- **Statutory Leave Management**:
  - **Maternal and Child Welfare Law (UU KIA No. 4/2024)**: Maternity leave with 100% full wage for the first 3 months, extendable up to months 4 through 6 at 75% wage with medical recommendation.
  - **Long-term Illness Protection (Labor Law Article 93)**: Tiered salary coverage (Months 1–4: 100%, Months 5–8: 75%, Months 9–12: 50%, Months 13+: 25%).
  - Special statutory paid leave: Menstrual leave, miscarriage leave, marriage, bereavement, and family baptism/circumcision.
  - Annual leave quotas with automated forfeiture on **June 30** for unspent carry-over balances.
- **Overtime Orders (SPL) & PP 35/2021 Compliance**:
  - Statutory hourly overtime rate: $\frac{1}{173} \times \text{Monthly Wage}$.
  - Progressive statutory multiplier calculation:
    - *Workday*: 1st hour = $1.5\times$, 2nd hour onward = $2.0\times$.
    - *Weekly Off / Public Holiday (5-day work week)*: Hours 1–8 = $2.0\times$, 9th hour = $3.0\times$, 10th hour onward = $4.0\times$.
    - *Weekly Off / Public Holiday (6-day work week)*: Hours 1–7 = $2.0\times$, 8th hour = $3.0\times$, 9th hour onward = $4.0\times$.
  - **Compliance Alert**: Real-time non-compliance warnings if scheduled overtime exceeds legal thresholds (4 hours/day or 18 hours/week under PP 35/2021 Article 26).
- **Public Holidays & Collective Leave**:
  - Official holiday scheduling based on Joint Ministerial Decrees (*SKB 3 Menteri*) integrated with payroll cut-off and overtime multiplier logic.

### 3. Payroll & Income Tax (PPh 21 TER)
- **Income Tax PPh 21 TER Calculation (Ministerial Regulation PMK 168/2023)**:
  - Automated TER Category classification (TER A, TER B, or TER C) based on employee PTKP marital and dependent status.
  - Flexible tax calculation methods: Gross, Gross-Up (company-paid tax allowance), and Nett.
- **Statutory Social Security Contributions (BPJS)**:
  - BPJS Ketenagakerjaan: Work Accident Insurance (JKK, risk grades I–V), Life Insurance (JKM 0.30%), Old-Age Security (JHT 3.70% employer, 2% employee), and Pension Security (JP 2% employer, 1% employee with annual statutory cap).
  - BPJS Kesehatan: 4% employer and 1% employee capped at statutory ceiling (Rp 12,000,000).
- **Year-End Annual Tax Reconciliation (Article 17 UU HPP)**:
  - December annual progressive recalculation and automated handling for Overpayment (*Lebih Bayar*) refunds to employees.

### 4. Security, RBAC & Audit Trail
- **Dynamic Role-Based Access Control (RBAC)**: Fine-grained permission matrices controlling read, write, and approval capabilities per domain.
- **Comprehensive Audit Trail (`activity`)**: Immutable logging of administrative actions, employment changes, leave approvals, and payroll executions.

---

## Technical Stack

| Area | Technology | Description |
|---|---|---|
| **Monorepo Manager** | moon + pnpm workspaces | Centralized dependency catalog in `pnpm-workspace.yaml` |
| **Backend API** | Hono + oRPC + Effect-TS | Typed RPC, Clean Architecture, Domain-Driven Design |
| **Database & ORM** | PostgreSQL + Drizzle ORM | Type-safe schema definitions and automated migrations |
| **Authentication** | Better-Auth | First-party cookie-based session management |
| **Queue & Cache** | RabbitMQ + Redis | Background asynchronous workers and rate limiting |
| **Frontend Web** | React 19 + TanStack Suite | TanStack Router (SPA), Query, Form, Store |
| **Styling & UI** | Tailwind CSS v4 + shadcn/ui | Tailored design system, dark mode, high accessibility |
| **Quality & Tooling** | Biome, Vitest, Playwright | High-speed linting, unit testing, and architecture checks |

---

## Monorepo Layout

```
hris-management-ts/
├── apps/
│   ├── api/            # Backend API service (Hono + Effect-TS + Drizzle)
│   ├── api-e2e/        # API integration & E2E tests
│   ├── web/            # Frontend SPA application (TanStack Router + Tailwind v4)
│   └── web-e2e/        # Browser E2E tests (Playwright)
├── packages/
│   ├── schemas/        # Shared Zod schemas (DTOs & validation contracts)
│   ├── components/     # UI primitive components (shadcn/ui), guards, & theme
│   ├── permissions/    # Permission catalog & role definitions
│   ├── activity/       # Audit trail constants & utilities
│   ├── queue/          # RabbitMQ message broker client
│   ├── cache/          # Redis caching layer & rate limiting
│   ├── mail/           # Email delivery module (SMTP/Nodemailer)
│   ├── storage/        # S3-compatible object storage adapter
│   ├── logger/         # Structured logger factory (Pino)
│   ├── format/         # Currency (IDR), date, and numeric formatters
│   ├── messages/       # System and user notification message catalog
│   ├── migrations/     # Shared database migration runner
│   └── version/        # Single source of truth for app version (root package.json)
└── docker-compose.dev.yml # PostgreSQL, Redis, RabbitMQ, Mailpit
```

---

## Getting Started

### System Prerequisites
- **Node.js**: Version 24+
- **pnpm**: Version 11+
- **Docker & Docker Compose**: For local PostgreSQL, Redis, RabbitMQ, and Mailpit containers.
- *(Optional)*: [moon](https://moonrepo.dev/docs/install) + [proto](https://moonrepo.dev/proto).

### Installation & Local Setup

1. **Clone the Repository & Install Dependencies**:
   ```sh
   pnpm install
   ```

2. **Configure Environment Variables**:
   Copy the example environment files for both API and Web:
   ```sh
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```
   *Customize the variables in `.env` files to fit your local environment.*

3. **Initialize Infrastructure & Database**:
   Launch Docker containers, apply database migrations, and seed initial lookup data:
   ```sh
   make setup
   ```

4. **Start Development Servers**:
   ```sh
   make up
   ```
   The application services will be accessible at:
   - **Frontend Web**: `http://localhost:5173`
   - **Backend API**: `http://localhost:3001`
   - **Mailpit (Local Email Catcher)**: `http://localhost:8025`

Or run services independently:
```sh
make api     # Start the backend API on port 3001
make web     # Start the frontend web application on port 5173
make worker  # Start the background task consumer (RabbitMQ)
```

---

## Versioning & Health Probes

| Endpoint / Surface | Purpose | Response |
|---|---|---|
| `GET /api/health` / `health.check` RPC | Application health and operational status | `{ status: "ok", version }` |
| `GET /healthz` | Kubernetes liveness probe | `{ status, version }` |
| `GET /ready` | Kubernetes readiness probe (checks DB, Redis, RabbitMQ) | `{ status, version, dependencies }` (503 if any dependency is down) |
| `GET /metrics` | Prometheus text metrics | Request counts, latency, memory utilization |
| Route `/health` on Web | Visual operational dashboard | Real-time version synchronization check between Web and API |

---

## Main Commands

All monorepo workflows can be triggered using `make` or `moon`:

```sh
make help                             # Display all available make targets
make setup                            # Launch docker containers, run migrations, and seed
make services                         # Start Docker containers (PostgreSQL, Redis, RabbitMQ, Mailpit)
make services-stop                    # Stop Docker containers
make db-migrate                       # Execute Drizzle database migrations
make db-studio                        # Open Drizzle Studio visual database inspector
make check                            # Execute Biome check (linter + formatter)
make lint                             # Run code linting
make test                             # Run unit test suites (Vitest)
make build                            # Compile production bundles & validate TypeScript types
make e2e                              # Run end-to-end integration tests (API + Web)
make ci                               # Run all continuous integration checks
```

Using `moon` CLI directly:
```sh
moon run :check                       # Run Biome across all workspace projects
moon run :build                       # Type-check TypeScript across all packages and apps
moon run :test                        # Run all test suites
moon run api:db-generate              # Generate new Drizzle migration after schema modifications
```

---

## Code Governance & Release Workflow

- **Trunk-Based Development**: Short-lived feature branches merged into `trunk` via squash-merge once CI validation succeeds.
- **Strict Quality Gates**:
  1. *Biome Lint & Formatting*: Clean, consistent formatting with zero unresolved lint errors.
  2. *Strict Architecture Rules*: Enforced layer boundaries (*domain*, *application*, *infrastructure*, *presentation*) validated via automated architecture assertions (`architecture-rules.ts`).
  3. *End-to-End Type Safety*: Shared Zod validation schemas guarantee data contract integrity between API and Frontend.
- **Unified Dependency Versions**: Managed centrally through the pnpm workspace `catalog` to prevent library fragmentation.

---

## Reference Documentation

| Document | Description |
|---|---|
| [AGENTS.md](AGENTS.md) | Guidelines and conventions for contributors and AI coding agents |
| [docs/adding-a-module.md](docs/adding-a-module.md) | Step-by-step instructions for adding new modules, endpoints, and permissions |
| [docs/effect-services.md](docs/effect-services.md) | Architectural conventions for Effect-TS services and error domains |
| [docs/operations/](docs/operations/) | Operational guides for deployment, backups, alerting, and metrics |
