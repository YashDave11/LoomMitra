# LoomMitra 🧵

> **Digital passports, stories, and markets for Indian handloom.**

LoomMitra ("friend of the loom") is a platform that connects rural handloom weavers to digital markets, proves the authenticity of every weave with a QR-backed product passport, and gives cooperatives the digital tools to bargain collectively — built for the **Indian Handloom Hackathon 2026**.

---

## Overview

India's handloom sector employs millions of weavers, yet most of them are invisible to the buyers who wear their work. A Chanderi saree passes through so many hands that by the time it reaches a shelf, the weaver's name, village, and months of skill are gone — and worse, a machine-made copy sits next to it wearing the same "handloom" tag at half the price. Buyers can't tell the difference, so they stop paying the premium, and the weaver absorbs the loss.

**LoomMitra attacks this from three sides at once.** It onboards independent weavers onto a digital marketplace with nothing more than a phone. It issues every product a **digital passport** — the weaver's face and story, photos of the loom and fabric, and a hash-chained event timeline — reachable by scanning a QR code stitched to the tag, with no app install or login. And it gives cooperatives a shared dashboard to manage members, pool inventory, and take on bulk orders no single loom could fulfil alone.

The design deliberately spans three HH2026 problem statements — **2.1 (connecting rural weavers to digital markets)**, **2.2 (digital authenticity & weaver stories)**, and **4.3 (cooperative digitisation & collective bargaining)** — because in the field they are one problem: market access without trust doesn't raise prices, and trust without collective scale doesn't raise incomes. One platform, three levers: innovation in the trust layer, direct market access, sustainable fair pricing, economic empowerment of weavers, community-first cooperatives, and clean integration into the existing handloom ecosystem.

---

## Key features

- **🪡 Independent weaver onboarding** — a weaver registers with their name, village, craft specialty, and years at the loom. No middlemen, no paperwork; their profile *is* their storefront.
- **📜 Digital product passports** — every saree gets a passport: the story behind the piece, loom and fabric close-up photos, materials and pattern details, and a verified event timeline from warp to dispatch.
- **🔍 Buyer-facing authenticity view** — scan the QR on the tag and land straight on the weaver's face, their village, and the product's journey. Authenticity you can see makes the fake "handloom" sticker worthless.
- **🤝 Cooperative dashboard** — member rosters, pooled inventory, and bulk-order management in one place, so a cluster of weavers can quote and deliver like a single large supplier.
- **🖱️ Interactive prototype walkthrough** — the entire flow is clickable today, narrated step-by-step by **Meena**, a weaver guide character, in a hand-drawn black-and-white Excalidraw-style UI.

---

## Architecture

### Current prototype (this repo)

This repository is a **frontend-first clickable prototype**: every screen, flow, and interaction is real, but the data behind it is static sample data (`data/mockData.ts`). There is no backend, no database, and nothing to configure — the point is to let judges and users *experience* the end-to-end product before a line of backend code exists.

### Planned backend & full system

The production system adds a **Node.js API layer** (Express or NestJS) over **PostgreSQL with Prisma**, plus a dedicated **trust layer**: a QR generation service and a hash-chained event log, where each product event (woven → quality-checked → tagged → sold) carries the hash of the previous event, making the passport timeline tamper-evident.

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
 │ Cooperative │◀─ pooled │  │  Backend (planned)          │     │
 │  dashboard  │  orders ─│  │  Node.js · Express/NestJS   │     │
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

**Frontend (live in this repo)**
- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [ShadCN UI](https://ui.shadcn.com/) on Radix primitives
- [Tailwind CSS](https://tailwindcss.com/) — custom black-and-white, sketch/Excalidraw-style design language
- [Framer Motion](https://www.framer.com/motion/) — page reveals and micro-interactions
- [qrcode.react](https://www.npmjs.com/package/qrcode.react) — live QR generation in the passport screen
- [Lucide](https://lucide.dev/) icons

**Backend (planned)**
- Node.js with Express or NestJS
- PostgreSQL + Prisma ORM
- QR issuance service + hash-chained event logging for tamper-evident passports

---

## Project structure

```
app/
├── (marketing)/            # Landing page
├── dashboard/              # Walkthrough hub — pick a flow
├── weaver/onboarding/      # Step 1–2: weaver registration
├── product/
│   ├── create/             # Product creation with story & photos
│   └── passport/           # Digital passport + QR generation
├── buyer/view/             # Step 4: what a buyer sees after scanning
├── cooperative/dashboard/  # Step 5: members, inventory, bulk orders
├── productdetails/         # QR-scan landing: full product detail page
└── presentation/           # Pitch/slide view

components/
├── guide/                  # Meena — the persistent narrator character
├── layout/                 # AppShell (header, walkthrough strip, footer)
├── walkthrough/            # StepNav, StepHeader, timelines, demo toast
├── marketing/              # Landing page sections & hand-drawn doodles
└── ui/                     # ShadCN primitives (button, card, badge…)

data/
├── mockData.ts             # Weavers, products, events, cooperative data
└── phases.ts               # Walkthrough phase definitions
```

---

## Prototype walkthrough

The prototype is a guided five-step story. **Meena**, a weaver from the sample cooperative, follows you across every screen as a narrator — on each page she explains what you're looking at and why it matters to someone like her.

1. **Landing page** — the pitch: the problem, the three HH2026 problem statements, and a call to try the flow.
2. **Dashboard** — the walkthrough hub, laying out the journey phase by phase.
3. **Weaver onboarding** *(Steps 1–2)* — register a weaver: identity, village, craft, experience. Meena explains how this replaces the middleman's ledger.
4. **Product creation & passport** *(Step 3)* — add a saree with its story and photos, then watch its digital passport and QR code get generated, backed by a hash-chained event timeline.
5. **Buyer view** *(Step 4)* — the page a buyer lands on after scanning the tag: the verified weaver, the story behind the piece, the product's journey, and a demo "Buy now."
6. **Cooperative dashboard** *(Step 5)* — the cooperative's control room: members, pooled inventory, and incoming bulk orders.
7. **Product details page** (`/productdetails`) — the standalone QR-scan destination showing the full buyer-facing product experience.

Every "verified", "sold", and "ordered" you see is sample data — the walkthrough strip at the top of each screen says so, honestly and up front.

---

## How to run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click through.

> **No backend, no database, no environment variables required.** The current prototype is fully static — everything runs off `data/mockData.ts`, so it works offline and deploys anywhere Next.js does.

---

## Roadmap

- **Backend implementation** — Express/NestJS API, PostgreSQL + Prisma, real auth for weavers and cooperatives.
- **Production trust layer** — QR issuance pipeline and hash-chained, tamper-evident product event logs.
- **Real cooperative integrations** — replace mock data with live onboarding of pilot cooperatives and their inventory.
- **Multi-cluster rollout** — extend beyond the pilot cluster to multiple handloom regions (Chanderi, Pochampally, Bhagalpur…), with regional language support.
- **Incubation-ready build-out** — analytics for cooperatives, payment integration, and logistics hooks, aligned with the HH2026 incubation track.

---

## Credits & acknowledgements

- **India's handloom weavers and cooperatives** — the real authors of everything this platform tries to protect. Every screen here exists to make their work visible and their prices fair.
- **The Indian Handloom Hackathon 2026 organizers**, for framing problem statements that treat weavers as entrepreneurs, not beneficiaries.
- The open-source community behind Next.js, ShadCN, Radix, Tailwind, and Framer Motion, which made a hand-drawn prototype feel this real, this fast.

---

<p align="center"><em>LoomMitra · woven with care for the people who weave.</em></p>
