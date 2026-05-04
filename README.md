# 📦 GAS Dashboard Management

> **Enterprise-grade Google Apps Script** — Built with TypeScript, React, Clean Architecture, and a real PostgreSQL database. Develop locally like a modern web app, deploy to Google Apps Script when ready.

[![Build & Test](https://github.com/MSayib/local-gas-experiment/actions/workflows/deploy.yml/badge.svg)](https://github.com/MSayib/local-gas-experiment/actions/workflows/deploy.yml)

---

## ✨ What Is This?

A warehouse management dashboard that runs **inside Google Sheets** as a web app — but is developed with the same tooling you'd use for a professional web application:

- 🏗️ **Clean Architecture** — Domain-driven design with proper separation of concerns
- ⚛️ **React 19** — Modern component-based UI (not vanilla HTML templates)
- 🗃️ **Real Database** — PostgreSQL (local) / CockroachDB (production via GAS JDBC)
- 🧪 **Full Test Suite** — Jest with domain entity tests
- 🔥 **Hot Reload** — Instant feedback during development
- 📦 **Single-File Deploy** — Everything bundles into one `index.html` + one `bundle.gs`

### Why?

Google Apps Script is powerful for internal tools, but developing directly in the GAS editor is painful — no types, no tests, no local development, no version control. This project proves you can have **all of it** while still deploying to GAS.

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│         (Vite + vite-plugin-singlefile)              │
│                                                      │
│   SummaryCards · ProductTable · ProductForm          │
│   StockForm · StockHistory · ConfirmDialog          │
├──────────────────────┬──────────────────────────────┤
│    LocalApiClient    │       GasApiClient            │
│   (fetch → Hono)     │  (google.script.run)          │
├──────────────────────┴──────────────────────────────┤
│                  Use Cases Layer                     │
│                                                      │
│   GetProducts · CreateProduct · GetStockSummary     │
│   RecordStockIn · RecordStockOut                    │
├─────────────────────────────────────────────────────┤
│                   Ports (Interfaces)                 │
│                                                      │
│   ProductPort · StockMovementPort · DatabasePort    │
├──────────────────────┬──────────────────────────────┤
│   PgDatabaseGateway  │   JdbcDatabaseGateway        │
│   (node-postgres)    │   (GAS Jdbc service)         │
├──────────────────────┼──────────────────────────────┤
│   PostgreSQL :5433   │   CockroachDB (Cloud)        │
│   (Local Dev)        │   (GAS Production)           │
└──────────────────────┴──────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Architecture | Clean Architecture | Domain logic reusable across local dev and GAS |
| Data Access | Raw SQL via `DatabasePort` | Same queries work on `pg` and GAS `Jdbc` — no ORM lock-in |
| Migration | dbmate (standalone binary) | Zero npm deps, plain `.sql` files, CockroachDB compatible |
| Frontend | React + Vite | HMR during dev, single-file bundle for GAS deploy |
| API Layer | Hono (local) / google.script.run (GAS) | `ApiClient` interface abstracts the difference |
| Module System | ESM (`"type": "module"`) | Modern TypeScript, tree-shakeable |

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── deploy.yml              # CI: type-check → test → build → verify
│
├── db/
│   └── migrations/             # dbmate SQL migrations
│       ├── 20260504001_create_products_table.sql
│       └── 20260504002_create_stock_movements_table.sql
│
├── dist/                       # Build output (git-ignored)
│   ├── bundle.gs               # Server code for GAS
│   ├── index.html              # Single-file React app
│   └── appsscript.json         # GAS manifest
│
├── src/
│   ├── domain/                 # 🟢 Enterprise Business Rules
│   │   └── entities/
│   │       ├── Product.ts
│   │       ├── StockMovement.ts
│   │       └── common/ValueObjects.ts
│   │
│   ├── application/            # 🔵 Application Business Rules
│   │   ├── ports/              # Interfaces (dependency inversion)
│   │   │   ├── DatabasePort.ts
│   │   │   ├── ProductPort.ts
│   │   │   └── StockMovementPort.ts
│   │   └── use-cases/warehouse/
│   │       ├── CreateProductUseCase.ts
│   │       ├── GetProductsUseCase.ts
│   │       ├── GetStockSummaryUseCase.ts
│   │       ├── RecordStockInUseCase.ts
│   │       └── RecordStockOutUseCase.ts
│   │
│   ├── adapters/               # 🟡 Interface Adapters
│   │   ├── gateways/
│   │   │   ├── PgDatabaseGateway.ts    # Local: node-postgres
│   │   │   └── JdbcDatabaseGateway.ts  # GAS: Jdbc service
│   │   └── repositories/
│   │       ├── SqlProductRepository.ts
│   │       └── SqlStockMovementRepository.ts
│   │
│   ├── infrastructure/         # 🔴 Frameworks & Drivers
│   │   └── gas/index.ts        # GAS entry point (doGet, server functions)
│   │
│   ├── server/
│   │   └── local/index.ts      # Hono dev server (:3001)
│   │
│   ├── client/                 # ⚛️ React Frontend
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/         # UI components
│   │   ├── lib/
│   │   │   ├── api/            # ApiClient abstraction
│   │   │   └── hooks/          # Custom React hooks
│   │   └── styles/
│   │       └── global.css      # Dark theme design system
│   │
│   └── db/
│       └── seed.ts             # Database seeder
│
├── test/                       # Jest test suites
├── esbuild.config.cjs          # Server bundle config
├── vite.config.ts              # Client bundle config
└── tsconfig.json               # TypeScript config with path aliases
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Bun** | ≥ 1.x | `curl -fsSL https://bun.sh/install \| bash` |
| **Node.js** | ≥ 20 | Required for Jest runtime |
| **PostgreSQL** | ≥ 15 | `brew install postgresql@15` |
| **dbmate** | ≥ 2.x | `brew install dbmate` |

### 1. Clone & Install

```bash
git clone https://github.com/MSayib/local-gas-experiment.git
cd local-gas-experiment
bun install
```

### 2. Setup Database

```bash
# Create the database (adjust port if needed)
PGPASSWORD=password psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE gas_experiment;"

# Copy environment variables
cp .env.example .env
# Edit .env if your PostgreSQL port/credentials differ

# Run migrations
bun run db:migrate

# Seed sample data
bun run db:seed
```

### 3. Start Development

```bash
bun run dev
```

This starts **two servers** concurrently:

| Server | URL | Purpose |
|--------|-----|---------|
| Vite | `http://localhost:5173` | React frontend (HMR) |
| Hono | `http://localhost:3001` | API server (mirrors GAS functions) |

Open `http://localhost:5173` in your browser — you'll see the warehouse dashboard with real data from PostgreSQL! 🎉

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both frontend & backend in dev mode |
| `bun run build` | Build production bundle (`dist/`) |
| `bun run test` | Run Jest test suite |
| `bun run type-check` | TypeScript type checking |
| `bun run deploy` | Build + push to Google Apps Script |
| `bun run db:migrate` | Apply pending database migrations |
| `bun run db:rollback` | Rollback last migration |
| `bun run db:status` | Check migration status |
| `bun run db:seed` | Seed database with sample data |

---

## 🔄 Development Workflow

```
 ┌─ You code here ─────────────────────────────────────────────────────┐
 │                                                                      │
 │  src/  ──→  bun run dev  ──→  http://localhost:5173 (hot reload)    │
 │                                                                      │
 │  Edit domain logic, use cases, UI components                        │
 │  Changes reflected instantly — no deploy needed!                    │
 │                                                                      │
 └──────────────────────────────────────────────────────────────────────┘
                                │
                    When ready to deploy
                                │
                                ▼
 ┌─ Build Pipeline ────────────────────────────────────────────────────┐
 │                                                                      │
 │  1. bun run type-check     ← TypeScript strict mode                 │
 │  2. bun run test           ← Jest unit tests                        │
 │  3. bun run build          ← esbuild (server) + Vite (client)      │
 │     ├── dist/bundle.gs     ← All server code in one IIFE           │
 │     ├── dist/index.html    ← React app inlined (CSS + JS)          │
 │     └── dist/appsscript.json                                        │
 │                                                                      │
 └──────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
 ┌─ Deploy to Google Apps Script ──────────────────────────────────────┐
 │                                                                      │
 │  clasp login               ← One-time OAuth login                   │
 │  bun run deploy            ← clasp push --force                     │
 │                                                                      │
 │  dist/bundle.gs   → GAS "bundle.gs"   (server functions)           │
 │  dist/index.html  → GAS "index.html"  (web app UI)                 │
 │                                                                      │
 │  GAS doGet() → HtmlService → Serves React app                      │
 │  Frontend calls google.script.run.getProducts() etc.               │
 │                                                                      │
 └──────────────────────────────────────────────────────────────────────┘
```

### CI/CD (GitHub Actions)

Every push to `main` triggers the CI pipeline:

```
push → checkout → install → type-check → test → build → verify dist
```

Deploy to GAS is done **manually** from your local machine (`bun run deploy`), since Google OAuth tokens have limited lifetimes.

---

## 🗄️ Database

### Local Development

- **Engine**: PostgreSQL (port 5433)
- **Database**: `gas_experiment`
- **Migrations**: Managed by [dbmate](https://github.com/amacneil/dbmate) — plain SQL files

### Production (GAS)

- **Engine**: CockroachDB (PostgreSQL-compatible)
- **Connection**: GAS `Jdbc.getConnection()` service
- **Credentials**: Stored in GAS Script Properties (not in code)

### Why This Works

Both PostgreSQL and CockroachDB speak the same SQL dialect. The `DatabasePort` interface abstracts the connection layer:

```typescript
// Same SQL works everywhere
const result = await db.query(
  'SELECT id, sku, name, price FROM products WHERE sku = $1',
  ['SKU-001']
);
```

- **Locally**: `PgDatabaseGateway` → `node-postgres` → PostgreSQL
- **In GAS**: `JdbcDatabaseGateway` → `Jdbc.getConnection()` → CockroachDB

---

## 🧪 Testing

```bash
bun run test
```

Current test coverage:
- ✅ Domain entities (Product, Money, Quantity)
- ✅ Use cases (GetProductsUseCase)
- ✅ Value objects validation

Tests use **mocked ports** — no database required.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Language** | TypeScript 5 (strict) | Type safety across all layers |
| **Runtime** | Bun | Fast dev server, package manager, script runner |
| **Frontend** | React 19 + Vite 8 | Component UI with HMR |
| **Bundling** | esbuild (server) + vite-plugin-singlefile (client) | GAS-compatible output |
| **Styling** | Vanilla CSS | Dark theme design system, zero dependencies |
| **Dev Server** | Hono | Lightweight API server mirroring GAS functions |
| **Database** | PostgreSQL / CockroachDB | ACID-compliant, SQL-compatible |
| **Migrations** | dbmate | Zero-dep, SQL-first, language-agnostic |
| **Testing** | Jest + ts-jest | Unit tests with TypeScript support |
| **CI** | GitHub Actions | Type-check → test → build → verify |
| **Deploy** | clasp | Push to Google Apps Script |

---

## 🏗️ Setting Up GAS Production (Optional)

> Only needed if you want to deploy to Google Apps Script.

### 1. Enable Apps Script API

Go to [script.google.com/home/usersettings](https://script.google.com/home/usersettings) and enable the API.

### 2. Login with clasp

```bash
npx clasp login
```

### 3. Create a GAS Project

```bash
npx clasp create --title "Dashboard Management" --type webapp --rootDir dist
```

This generates `.clasp.json` with your `scriptId`.

### 4. Set Script Properties (CockroachDB)

In Google Apps Script editor → ⚙️ Project Settings → Script Properties:

| Key | Value |
|-----|-------|
| `DB_URL` | `jdbc:postgresql://...cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full` |
| `DB_USER` | Your CockroachDB username |
| `DB_PASSWORD` | Your CockroachDB password |

### 5. Deploy

```bash
bun run deploy
```

Then in GAS editor: Deploy → New deployment → Web app → Access: Anyone.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Follow the existing architecture patterns
4. Write tests for new use cases
5. Ensure `bun run type-check && bun run test && bun run build` passes
6. Submit a pull request

### Architecture Rules

- **Domain entities** must have zero external dependencies
- **Use cases** depend only on ports (interfaces), never on implementations
- **SQL queries** must be compatible with both PostgreSQL and CockroachDB
- **Frontend components** access data only through custom hooks

---

## 📄 License

MIT

---

<p align="center">
  <sub>Built with 🔥 TypeScript + React + Clean Architecture + Google Apps Script</sub>
</p>
