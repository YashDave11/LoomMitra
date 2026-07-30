# LoomMitra 🧵

> **Digital passports, stories, and markets for Indian handloom.**

LoomMitra ("friend of the loom") is a platform that connects rural handloom weavers to digital markets, proves the authenticity of every weave with a QR-backed product passport, and gives cooperatives the digital tools to bargain collectively — built for the **Indian Handloom Hackathon 2026**.

---

## Overview

India's handloom sector employs millions of weavers, yet most of them are invisible to the buyers who wear their work. A Chanderi saree passes through so many hands that by the time it reaches a shelf, the weaver's name, village, and months of skill are gone — and worse, a machine-made copy sits next to it wearing the same "handloom" tag at half the price. Buyers can't tell the difference, so they stop paying the premium, and the weaver absorbs the loss.

**LoomMitra attacks this from three sides at once.** It onboards independent weavers onto a digital marketplace with nothing more than a phone. It issues every product a **digital passport** — the weaver's face and story, photos of the loom and fabric, and a hash-chained event timeline — reachable by scanning a QR code stitched to the tag, with no app install or login. And it gives cooperatives a shared dashboard to manage members, pool inventory, and take on bulk orders no single loom could fulfil alone.

The design deliberately spans three HH2026 problem statements — **2.1 (connecting rural weavers to digital markets)**, **2.2 (digital authenticity & weaver stories)**, and **4.3 (cooperative digitisation & collective bargaining)** — because in the field they are one problem: market access without trust doesn't raise prices, and trust without collective scale doesn't raise incomes.

---

## Architecture

```
                          ┌──────────────────────────────────────┐
                          │              LoomMitra               │
                          │                                      │
 ┌─────────┐              │  ┌─────────────────────────────┐     │             ┌─────────────┐
 │ Weaver  │─ onboards ──▶│  │  Frontend                   │     │◀── scans ───│    Buyer    │
 │         │   products   │  │  Next.js · ShadCN · Tailwind│     │     QR      │  (no app,   │
 └─────────┘              │  └──────────────┬──────────────┘     │             │  no login)  │
                          │                 │                    │             └─────────────┘
 ┌─────────────┐          │  ┌──────────────┴──────────────┐     │
 │ Cooperative │◀─ pooled │  │  Backend                    │     │
 │  dashboard  │  orders ─│  │  Node.js · Express          │     │
 └─────────────┘          │  │  PostgreSQL · Prisma        │     │
                          │  └──────────────┬──────────────┘     │
                          │  ┌──────────────┴──────────────┐     │
                          │  │  Trust layer (planned)      │     │
                          │  │  QR issuance · hash-chained │     │
                          │  │  product event logs         │     │
                          │  └─────────────────────────────┘     │
                          └──────────────────────────────────────┘
```

---

## Tech stack

**Frontend**
- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [ShadCN UI](https://ui.shadcn.com/) on Radix primitives
- [Tailwind CSS](https://tailwindcss.com/) — custom black-and-white, sketch/Excalidraw-style design language
- [Framer Motion](https://www.framer.com/motion/) — page reveals and micro-interactions
- [qrcode.react](https://www.npmjs.com/package/qrcode.react) — live QR generation in the passport screen
- [Lucide](https://lucide.dev/) icons

**Backend (`/server`)**
- Node.js with Express + TypeScript
- PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- JWT authentication with bcrypt password hashing
- Role-based access control (WEAVER, BUSINESS, CUSTOMER)

---

## Project structure

```
app/
├── (marketing)/            # Landing page (hero, problem, solution, features)
├── auth/
│   ├── login/              # Login page
│   └── register/           # Multi-role registration page
├── app/
│   ├── weaver/profile/     # Weaver profile form (role-gated)
│   ├── business/profile/   # Business profile form (role-gated)
│   └── customer/profile/   # Customer profile form (role-gated)
├── dashboard/              # Walkthrough hub (prototype)
├── weaver/onboarding/      # Step 1–2: weaver registration (prototype)
├── product/
│   ├── create/             # Product creation (prototype)
│   └── passport/           # Digital passport + QR (prototype)
├── buyer/view/             # Buyer scan view (prototype)
├── cooperative/dashboard/  # Cooperative dashboard (prototype)
├── productdetails/         # QR-scan landing (prototype)
└── presentation/           # Pitch/slide view (prototype)

components/
├── guide/                  # Meena — the persistent narrator character
├── layout/                 # AppShell, MainLayout, AmbientBackground
├── marketing/              # Landing page sections & hand-drawn doodles
├── walkthrough/            # StepNav, StepHeader, timelines, demo toast
└── ui/                     # ShadCN primitives (button, card, badge…)

lib/
├── AuthContext.tsx          # React context for auth state
├── apiClient.ts            # Typed API client with auto Bearer header
├── authStorage.ts          # localStorage-backed token/role persistence
├── useRequireRole.ts       # Hook to gate pages by role
└── types.ts                # Shared TypeScript types

server/
├── prisma/
│   └── schema.prisma       # Prisma schema (User, profiles, Product, MediaAsset, enums)
├── src/
│   ├── index.ts            # Express entry point (port 4000)
│   ├── prisma.ts           # Singleton PrismaClient
│   ├── middleware/
│   │   └── auth.ts         # requireAuth + requireRole middleware
│   ├── routes/
│   │   ├── auth.ts         # POST /auth/register, POST /auth/login
│   │   ├── weaver.ts       # POST/GET /api/weaver/profile
│   │   ├── business.ts     # POST/GET /api/business/profile
│   │   ├── customer.ts     # POST/GET /api/customer/profile
│   │   └── products.ts     # Product CRUD + image upload + catalog generation
│   ├── services/
│   │   ├── catalogPlanner.ts    # 5-shot catalog plan by product type
│   │   ├── styleSelector.ts     # Auto style phrase from product metadata
│   │   ├── geminiImageClient.ts # Gemini API image generation client
│   │   └── catalogGenerator.ts  # Orchestrates plan → generate → upload
│   └── types.ts            # Shared TypeScript types (mirrors lib/types.ts)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## How to run

### Prerequisites

- Node.js 18+
- A PostgreSQL database (we use a Render-hosted external Postgres instance)

### 1. Backend (`/server`)

```bash
cd server

# Install dependencies
npm install

# Create .env from the example
cp .env.example .env

# Edit .env and set:
#   DATABASE_URL — your Render Postgres external connection string
#   JWT_SECRET — any strong random string
#   PORT — defaults to 4000
#   FRONTEND_URL — defaults to http://localhost:3000
```

> **Important:** `DATABASE_URL` must point to the Render-hosted Postgres external connection string. Do not use a local Postgres instance. The format is:
> ```
> postgresql://user:password@host:port/dbname
> ```

```bash
# Generate the Prisma client
npx prisma generate

# Run the initial migration (creates tables in your Render Postgres)
npx prisma migrate dev --name init

# Start the dev server
npm run dev
```

The backend will be running at `http://localhost:4000`.

### 2. Frontend (root directory)

```bash
# Install dependencies (from root)
npm install

# Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" > .env.local

# Start the Next.js dev server
npm run dev
```

The frontend will be running at `http://localhost:3000`.

---

## Phase 1 routes

### Auth
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register with `{ email, password, role }` → `{ token, role }` |
| `POST` | `/auth/login` | Login with `{ email, password }` → `{ token, role }` |

### Profiles (all protected — require JWT + matching role)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/weaver/profile` | Create/update weaver profile (upsert) |
| `GET` | `/api/weaver/profile/me` | Get current user's weaver profile |
| `POST` | `/api/business/profile` | Create/update business profile (upsert) |
| `GET` | `/api/business/profile/me` | Get current user's business profile |
| `POST` | `/api/customer/profile` | Create/update customer profile (upsert) |
| `GET` | `/api/customer/profile/me` | Get current user's customer profile |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Returns `{ status: "ok" }` |

### Products (all protected — require JWT + WEAVER role)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/products` | Create a new product |
| `GET` | `/api/products` | List current weaver's products |
| `GET` | `/api/products/:id` | Get single product with images |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product and its images |
| `POST` | `/api/products/:id/raw-images` | Upload raw product images (multipart, max 5) |
| `DELETE` | `/api/products/:id/images/:imageId` | Delete a single image |
| `POST` | `/api/products/:id/generate-catalog` | Trigger AI catalog generation (fire-and-forget) |
| `GET` | `/api/products/:id/catalog-status` | Poll catalog generation progress |

### Frontend pages
| Path | Description |
|------|-------------|
| `/` | Landing page with "Register" CTA |
| `/auth/register` | Multi-role registration (Weaver / Business / Direct Customer) |
| `/auth/login` | Login form |
| `/app/weaver/profile` | Weaver profile form (role-gated to WEAVER) |
| `/app/business/profile` | Business profile form (role-gated to BUSINESS) |
| `/app/customer/profile` | Customer profile form (role-gated to CUSTOMER) |

---

## Environment variables

### Backend (`server/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Render Postgres external connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `PORT` | No | Server port (default: `4000`) |
| `FRONTEND_URL` | No | CORS origin (default: `http://localhost:3000`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for image storage |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI catalog generation |

### Frontend (`.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | No | Backend URL (default: `http://localhost:4000`) |

> **Note:** `DATABASE_URL` must point to the Render-hosted Postgres external connection string for both local development and the deployed backend on Render.

---

## Key features

- **🪡 Independent weaver onboarding** — a weaver registers with their name, village, craft specialty, and years at the loom. No middlemen, no paperwork; their profile *is* their storefront.
- **📜 Digital product passports** — every saree gets a passport: the story behind the piece, loom and fabric close-up photos, materials and pattern details, and a verified event timeline from warp to dispatch.
- **🔍 Buyer-facing authenticity view** — scan the QR on the tag and land straight on the weaver's face, their village, and the product's journey.
- **🤝 Cooperative dashboard** — member rosters, pooled inventory, and bulk-order management in one place.
- **🖱️ Interactive prototype walkthrough** — the entire flow is clickable today, narrated step-by-step by **Meena**, a weaver guide character, in a hand-drawn black-and-white Excalidraw-style UI.
- **🤖 AI catalog generation** — one-click generation of 5 professional catalog photos per product using Google Gemini, with live per-shot progress tracking.

---

## AI catalog generation

LoomMitra automatically generates professional e-commerce catalog photos from raw product images using Google Gemini's image generation API.

### How it works

1. **Plan** — based on the product type (saree, muffler, etc.), the system creates a 5-shot catalog plan: model front view, model side view, hanger display, close-up texture, and close-up border/edge detail.
2. **Auto-style** — a style phrase is selected automatically based on the product type and description keywords (festive/wedding, casual/daily, or default studio styling). No manual style selection is needed.
3. **Generate** — the 5 shots are generated sequentially via Gemini (`gemini-2.5-flash-image`), each using the first raw product image as a visual reference. Generation is sequential (not parallel) to stay within Gemini free-tier rate limits and to allow real-time per-shot progress updates.
4. **Upload** — each successfully generated image is uploaded to Cloudinary and linked as a catalog `MediaAsset`.
5. **Live progress** — the frontend polls `GET /api/products/:id/catalog-status` every 2 seconds while generation is in progress, showing "1/5, 2/5..." status for each shot. Polling stops once `catalogStatus` is `DONE` or `FAILED`.

### Catalog status

- `NOT_STARTED` — no catalog generation has been triggered.
- `PROCESSING` — generation is in progress; poll for per-shot updates.
- `DONE` — at least 3 of 5 shots succeeded.
- `FAILED` — fewer than 3 shots succeeded.

---

## Roadmap

- **Production trust layer** — QR issuance pipeline and hash-chained, tamper-evident product event logs.
- **Product CRUD API** — backend routes for creating, listing, and managing products.
- **Cooperative integrations** — replace mock data with live onboarding of pilot cooperatives and their inventory.
- **Multi-cluster rollout** — extend beyond the pilot cluster to multiple handloom regions (Chanderi, Pochampally, Bhagalpur…), with regional language support.
- **Incubation-ready build-out** — analytics for cooperatives, payment integration, and logistics hooks, aligned with the HH2026 incubation track.

---

## Credits & acknowledgements

- **India's handloom weavers and cooperatives** — the real authors of everything this platform tries to protect. Every screen here exists to make their work visible and their prices fair.
- **The Indian Handloom Hackathon 2026 organizers**, for framing problem statements that treat weavers as entrepreneurs, not beneficiaries.
- The open-source community behind Next.js, ShadCN, Radix, Tailwind, and Framer Motion, which made a hand-drawn prototype feel this real, this fast.

---

<p align="center"><em>LoomMitra · woven with care for the people who weave.</em></p>
