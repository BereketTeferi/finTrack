<div align="center">

<img src="public/icons/icon-512.png" width="120" height="120" alt="FinTrack Logo" />

# FinTrack

### Smart Expense & Income Tracker

A premium, futuristic personal finance platform for tracking expenses, income, budgets, and financial insights. Built with Next.js 16, TypeScript, Prisma, and a beautiful fintech-grade UI.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![NextAuth](https://img.shields.io/badge/NextAuth.js-000000?style=flat-square&logo=auth0&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [PWA — Install as a Mobile App](#pwa--install-as-a-mobile-app)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**FinTrack** is a production-ready personal finance platform inspired by YNAB, Mint, Monarch Money, and Revolut Analytics. It helps users:

- Track income and expenses across multiple accounts
- Monitor cash flow with interactive charts
- Set monthly budgets and get early warnings
- Analyze spending patterns with deep insights
- Get a **Financial Health Score** (0–100) based on their financial behavior
- Receive **smart insights** automatically generated from their transaction history
- Extend transactions with **custom fields** (perfect for trading journals, business tracking, etc.)
- Install as a **native mobile app** on Android/iOS via PWA — syncs automatically with the web

The app is designed as a **SaaS-ready fintech platform** with a clean, futuristic aesthetic.

---

## Features

### Authentication & Security
- Email + password authentication with **bcrypt hashing**
- JWT-based sessions via NextAuth.js v4
- Auto-provisions 16 default categories + a Cash account on signup
- "Forgot password?" flow for self-service password reset

### Dashboard
- 4 summary cards: **Total Balance, Income, Expenses, Net Profit** — each with trend % vs previous period
- Period filters: daily, weekly, monthly, yearly
- Interactive **cash flow chart** (income / expense / net) with multiple period views
- **Expense breakdown** donut chart with category legend
- **Smart insights panel** — auto-generated signals like *"You spent 35% more on Food this month"*
- Recent transactions list with inline edit

### Transactions
- Full CRUD with type tabs (Income / Expense)
- Multi-currency support (**69 currencies** including ETB, NGN, KES, ZAR, INR, EUR, JPY, and more)
- Date + time picker
- Account + category selectors with color dots
- Tag system with chips
- Notes field
- **Dynamic custom fields** that auto-render based on the selected account
- Powerful filtering: search, type, account, category, date range
- Sortable by date or amount
- CSV export with date filtering

### Accounts
- Multiple account types: **Cash, Bank, Savings, Credit Card, Mobile Wallet**
- Color-coded cards with balance tracking
- Per-account transaction counts
- **Atomic transfers between accounts** (via Prisma `$transaction`)
- Visual distinction between positive balances (assets) and negative (liabilities)

### Budgets
- Per-category monthly budgets
- Animated progress bars with color states:
  - Green: on track
  - Amber: getting close to limit
  - Red: over budget
- Used / remaining amounts
- "Over budget by X" or "On track" status indicators

### Analytics
- **Financial Health Score** (0–100) with SVG circular gauge, weighted by:
  - Savings Rate (35%)
  - Income Consistency (20%)
  - Expense Ratio (25%)
  - Budget Adherence (20%)
- Score components breakdown
- Personalized recommendations
- Top spending categories (horizontal bar chart)
- Income sources analysis
- Largest single expenses
- Cash flow analysis with period filters

### Smart Insights
Auto-generated insights including:
- Category-over-month change detection (e.g. *"You spent 56% more on Food this month"*)
- Budget overruns (actual + projected)
- Savings rate feedback
- Largest expense highlighting

### Categories
- Default income categories (6): Salary, Business, Freelance, Investment, Bonus, Other
- Default expense categories (10): Food, Transport, Shopping, Entertainment, Bills, Education, Health, Rent, Travel, Other
- Full CRUD with **20-icon picker** and **16-color picker**
- Live preview while editing

### Recurring Transactions
- Frequencies: Daily, Weekly, Monthly, Yearly (with custom interval)
- Next-date tracking
- Active / paused toggle
- Auto-categorization support

### Custom Fields Engine
Extend transactions with your own fields — perfect for:
- **Trading Journal**: Trade Pair, Risk %, Setup Type
- **Business**: Client, Invoice Number
- **Personal**: Location, Vendor

- **5 field types**: Text, Number, Date, Dropdown, Checkbox
- Scope: Global or per-account
- Required field toggle
- Dropdown options editor
- Live preview
- **Fields auto-appear on transaction forms based on selected account**

### Notifications
- Type-aware: budget limit, upcoming bill, low balance, recurring, insight, general
- Unread badge in sidebar + topbar
- Mark all read / mark individual / delete

### Settings
- Profile: name, email, currency (searchable picker with 69 currencies), avatar color
- Data management: account/transaction stats, load demo data, export CSV, wipe all transactions
- Security & session info

### UI/UX
- Modern **fintech aesthetic** with glassmorphism, soft shadows, smooth animations
- Full **dark + light mode** with system theme detection
- Color system: income=green, expense=red, savings=blue, investments=purple
- **Mobile-first responsive** design
- **Command palette** (⌘K) for fast navigation
- Sidebar with grouped navigation + collapse mode
- Animated view transitions via Framer Motion
- Custom scrollbar styling
- Safe-area insets for notched devices

### PWA — Installable Mobile App
- **Installable on Android** (Chrome) and **iOS** (Safari)
- Home screen icon with brand gradient
- Full-screen standalone mode
- **Offline support** via service worker (cached app shell + last-viewed data)
- 3 long-press shortcuts: Add Transaction, Dashboard, Analytics
- Push notification handler (ready for future use)
- Auto-update mechanism with "Update available" banner

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| Database | **PostgreSQL** (Neon / Supabase / Vercel Postgres / Railway) |
| ORM | **Prisma 6** |
| Auth | **NextAuth.js v4** (JWT strategy, bcrypt hashing) |
| Styling | **Tailwind CSS 4** |
| UI Components | **shadcn/ui** (New York style) + **Lucide icons** |
| State | **Zustand** (UI) + **TanStack Query v5** (server) |
| Charts | **Recharts** |
| Animations | **Framer Motion** |
| Forms | **React Hook Form** + **Zod** |
| PWA | Custom service worker + Web App Manifest |
| Package Manager | **Bun** |

---

## Screenshots

> Screenshots are saved in `/download/` after running the app locally.

| Dashboard | Transactions | Analytics | Mobile (PWA) |
|-----------|--------------|-----------|---------------|
| ![Dashboard](download/dashboard-preview.png) | ![Transactions](download/transactions-preview.png) | ![Analytics](download/analytics-preview.png) | ![Mobile](download/pwa-mobile-auth.png) |

---

## Quick Start

### Prerequisites

- **Node.js 18+** or **Bun** (recommended)
- A **PostgreSQL** database (Neon free tier recommended — works on Vercel)

> ⚠️ **SQLite does not work on Vercel** (serverless has a read-only filesystem). Use PostgreSQL for both local dev and production.

### 1. Clone & install

```bash
git clone <your-repo-url>
cd fintrack
bun install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
NEXTAUTH_SECRET=run `openssl rand -base64 32` to generate
```

### 3. Set up the database

```bash
# Auto-detects provider from DATABASE_URL (sqlite for local, postgresql for production)
bun run prisma:switch

# Create all tables
bun run db:push
```

### 4. Start the dev server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and register a new account. Click **"Load Demo Data"** on the dashboard to seed 4 months of realistic transactions.

---

## Deployment

### Deploy to Vercel (recommended)

1. **Push to GitHub** and import the repo into Vercel
2. **Set environment variables** in Vercel → Settings → Environment Variables:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon/Supabase PostgreSQL connection string |
   | `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |

3. **Deploy** — Vercel will run `postinstall` which auto-detects PostgreSQL and generates the Prisma client
4. Push the schema to your production database (run locally with `DATABASE_URL` set to your prod DB):

   ```bash
   DATABASE_URL=your-prod-postgres-url bun run db:push
   ```

5. Visit your Vercel URL → Sign up → Dashboard loads

See **[DEPLOY.md](DEPLOY.md)** for a comprehensive deployment guide with troubleshooting.

### Other platforms

The app also deploys cleanly to:
- **Netlify** (with the Next.js plugin)
- **Railway**
- **Render**
- **Docker** (any container host)

---

## Project Structure

```
fintrack/
├── 📁 prisma/
│   └── schema.prisma              # 12 Prisma models (User, Account, Transaction, etc.)
├── 📁 public/
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker (offline support)
│   ├── favicon.ico                # Multi-size favicon (brand gradient)
│   ├── logo.svg                   # Brand logo SVG
│   └── icons/                     # PWA icons (192, 512, maskable, apple-touch)
├── 📁 scripts/
│   ├── generate-icons.py          # Generate PWA icons from brand gradient
│   ├── generate-favicon.py        # Generate favicons
│   ├── prisma-switch.mjs          # Auto-switch Prisma provider (sqlite ↔ postgresql)
│   └── run-with-env.mjs           # Run commands with .env taking precedence
├── 📁 src/
│   ├── 📁 app/
│   │   ├── layout.tsx             # Root layout with PWA metadata
│   │   ├── page.tsx               # Auth gate (AuthScreen or AppShell)
│   │   ├── globals.css            # Tailwind + fintech theme (dark + light)
│   │   └── 📁 api/                # 16 API route files
│   │       ├── auth/              # register, [...nextauth], reset-password
│   │       ├── transactions/      # CRUD + filtering
│   │       ├── accounts/          # CRUD + transfers
│   │       ├── categories/        # CRUD
│   │       ├── budgets/           # CRUD with spent calculation
│   │       ├── recurring/         # CRUD
│   │       ├── custom-fields/     # CRUD
│   │       ├── notifications/     # CRUD + mark read
│   │       ├── analytics/         # summary, cash-flow, breakdown, insights, health
│   │       ├── export/            # CSV export
│   │       ├── tags/              # CRUD
│   │       ├── me/                # User profile
│   │       └── seed/              # Demo data seeder
│   ├── 📁 components/
│   │   ├── ui/                    # shadcn/ui components (pre-installed)
│   │   ├── views/                 # 10 view components (dashboard, transactions, etc.)
│   │   ├── charts/                # CashFlowChart, BreakdownPie
│   │   ├── transactions/          # TransactionFormDialog (with dynamic custom fields)
│   │   ├── auth-screen.tsx        # Split-screen auth UI
│   │   ├── app-shell.tsx          # Main shell with view routing
│   │   ├── sidebar.tsx            # Collapsible nav
│   │   ├── topbar.tsx             # Search + actions + profile
│   │   ├── command-palette.tsx    # ⌘K command menu
│   │   ├── install-prompt.tsx     # PWA install banner
│   │   ├── sw-register.tsx        # Service worker registration
│   │   ├── stat-card.tsx          # Reusable dashboard card
│   │   ├── category-icon.tsx      # Icon mapper (20 icons)
│   │   └── providers.tsx          # SessionProvider + ThemeProvider + QueryClient
│   └── 📁 lib/
│       ├── auth.ts                # NextAuth config (explicit cookie config for proxies)
│       ├── api.ts                 # getUserId helper (getServerSession)
│       ├── db.ts                  # Prisma client
│       ├── finance.ts             # Types, color system, default categories, formatCurrency
│       ├── currencies.ts          # 69 currencies with symbols + locales
│       ├── queries.ts             # All React Query hooks + mutations
│       └── store.ts               # Zustand UI state
├── .env.example                   # Template for env vars
├── DEPLOY.md                      # Comprehensive deployment guide
├── next.config.ts                 # Headers for PWA files
└── package.json                   # Scripts: dev, build, db:push, prisma:switch
```

---

## Database Schema

The app uses 12 Prisma models:

```
User ─┬─ Account ─┬─ Transaction ── Category
      │           ├─ Transfer (from/to)
      │           ├─ RecurringTransaction
      │           └─ CustomField ── CustomFieldValue
      ├─ Category
      ├─ Budget
      ├─ Tag
      └─ Notification
```

- **User**: email, name, passwordHash, currency, avatarColor
- **Account**: name, type (CASH/BANK/SAVINGS/CREDIT_CARD/MOBILE_WALLET), balance, color
- **Transaction**: type (INCOME/EXPENSE/TRANSFER), amount, date, description, tags (JSON), customFieldValues
- **Category**: name, type, color, icon, isDefault (16 default categories auto-created on signup)
- **Budget**: amount, period, year, category (optional for overall budgets)
- **RecurringTransaction**: frequency, interval, nextDate, active
- **CustomField**: name, type (TEXT/NUMBER/DATE/DROPDOWN/CHECKBOX), options, accountId (null = global)
- **CustomFieldValue**: transactionId, customFieldId, value
- **Tag**: name, color
- **Notification**: type, title, message, read
- **Transfer**: fromAccountId, toAccountId, amount (audit log for transfers)

Schema auto-switches between SQLite (local dev) and PostgreSQL (production) based on `DATABASE_URL`.

---

## API Reference

All endpoints require authentication (JWT in `next-auth.session-token` cookie).

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user (auto-creates categories + Cash account) |
| POST | `/api/auth/reset-password` | Reset password by email |
| POST | `/api/auth/callback/credentials` | NextAuth login endpoint |
| GET | `/api/auth/session` | Get current session |

### Transactions
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions` | List (filters: accountId, categoryId, type, from, to, q, tag, limit, offset) |
| POST | `/api/transactions` | Create (with customFieldValues) |
| PUT | `/api/transactions/:id` | Update (reverses old balance effect, applies new) |
| DELETE | `/api/transactions/:id` | Delete (reverses balance effect) |

### Accounts
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/accounts` | List with transaction counts |
| POST | `/api/accounts` | Create |
| PUT | `/api/accounts/:id` | Update (name, type, color, icon) |
| DELETE | `/api/accounts/:id` | Delete (cascades transactions) |
| POST | `/api/accounts/transfer` | Transfer between accounts (atomic via `$transaction`) |

### Categories, Budgets, Recurring, Custom Fields, Notifications, Tags
Standard CRUD endpoints for each.

### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/summary?period=month` | Summary cards with prev-period deltas |
| GET | `/api/analytics/cash-flow?period=monthly` | Time series (daily=14d, weekly=8w, monthly=12m, yearly=5y) |
| GET | `/api/analytics/breakdown` | Expense by category for current month |
| GET | `/api/analytics/insights` | Auto-generated smart insights |
| GET | `/api/analytics/health` | Financial Health Score (0-100) + recommendations |

### Export
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/export/transactions?format=csv&from=&to=` | CSV export with date filtering |

### Utility
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/me` | Get current user profile |
| PATCH | `/api/me` | Update profile (name, currency, avatarColor) |
| POST | `/api/seed` | Seed 4 months of demo data |

---

## PWA — Install as a Mobile App

FinTrack is a **Progressive Web App** — installable on Android and iOS with full offline support and automatic sync.

### Android (Chrome)

1. Open your deployed URL in **Chrome** on your Android phone
2. Sign in to your account
3. After 4 seconds, tap **Install App** on the banner that appears
   - Or: tap the ⋮ menu → **Install app**
4. The FinTrack icon appears on your home screen
5. Tap it → opens full-screen as a native app

### iOS (Safari)

1. Open your deployed URL in **Safari** on your iPhone
2. Sign in
3. Tap the **Share** button (square with arrow)
4. Tap **Add to Home Screen**
5. Tap **Add** — FinTrack icon appears on your home screen

### Long-press shortcuts

Long-press the FinTrack icon on your home screen to access:
- **Add Transaction** — quick capture
- **Dashboard** — financial overview
- **Analytics** — spending insights

### How sync works

The PWA uses the **same PostgreSQL backend** as the website. When you log in with the same account on your phone and laptop, you see the same transactions, budgets, accounts — everything. No separate sync logic needed.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development workflow

```bash
bun run dev          # Start dev server
bun run lint         # ESLint check
bun run db:push      # Push schema changes to DB
bun run db:generate  # Regenerate Prisma client
bun run prisma:switch # Switch provider (sqlite ↔ postgresql)
```

---

## License

MIT © FinTrack

---

<div align="center">

**Built with ❤️ using Next.js, Prisma, and Tailwind CSS**

[Report Bug](../../issues) · [Request Feature](../../issues) · [Read Docs](DEPLOY.md)

</div>
