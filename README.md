<div align="center">
  <img src="https://raw.githubusercontent.com/YashDave11/handloom/main/public/placeholder.svg" alt="LoomMitra Logo" width="120" />
  <h1>🧵 LoomMitra</h1>
  <p><strong>Digital passports, authentic stories, and direct markets for Indian handloom.</strong></p>

  <p>
    <a href="https://loommitra-4e42.onrender.com/"><img src="https://img.shields.io/badge/Web_App-Live-blue?style=for-the-badge&logo=vercel" alt="Web App" /></a>
    <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status" />
    <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-lightgrey?style=for-the-badge" alt="Platform" />
  </p>

  <p>
    <em>Built for the <b>Handloom Hackathon 2.0</b> — Connecting rural weavers to digital markets, proving authenticity with Blockchain, and empowering cooperatives.</em>
  </p>
</div>

---

## 📖 Overview

India's handloom sector employs millions of weavers, yet most of them remain invisible to the end buyers. A beautiful Chanderi or Pochampally saree passes through numerous hands, losing the weaver's story, identity, and margins along the way. Worse, cheap machine-made knockoffs flood the market bearing the "handloom" tag. 

**LoomMitra solves this from three dimensions:**
1. **Direct Digital Access:** Onboards independent weavers to a digital marketplace with just their smartphone.
2. **Blockchain Authenticity:** Issues a tamper-proof **Digital Passport** for every product, verifying the journey from warp to dispatch via a simple QR code scan.
3. **Cooperative Empowerment:** Provides a shared dashboard for weaver cooperatives to manage members, pool inventory, and handle bulk B2B orders seamlessly.

---

## 🚀 Key Features

- **📱 Independent Weaver Onboarding:** Weavers register with their name, village, craft specialty, and experience. No middlemen, no paperwork—their profile *is* their storefront.
- **🔗 Blockchain Product Passports:** Every product gets a digital passport. Scan the QR code on the physical tag to see the weaver's face, the loom, fabric close-ups, and a verified event timeline.
- **📸 AI Catalog Generation:** One-click generation of professional e-commerce photos! Using Google Gemini AI, raw loom photos are transformed into stunning model, hanger, and close-up shots.
- **🤝 Cooperative Dashboard:** Roster management, pooled inventory tracking, and bulk-order negotiations (RFQ) built natively for weaver cooperatives.
- **🛒 Unified Retail & Bulk Marketplace:** Customers can buy single authentic pieces (B2C), while businesses can negotiate bulk deals directly with the weavers (B2B).

---

## 🛠️ Technology Stack

LoomMitra is built with a modern, scalable, and robust tech stack spanning Web, Mobile, and Backend.

### **Frontend (Web)**
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router) with TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **Design Language:** Custom, modern, and accessible interface.

### **Frontend (Mobile)**
- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) & [Expo Router](https://docs.expo.dev/router/introduction/)
- **Navigation:** Deep linking & dynamic routing for seamless QR code scanning.
- **UI:** Custom native components optimized for rural connectivity.

### **Backend & Database**
- **Server:** Node.js & Express
- **Database:** PostgreSQL hosted on [Render](https://render.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** JWT-based Role-Based Access Control (RBAC)

### **AI & Cloud Integrations**
- **AI Engine:** Google Gemini (`gemini-2.5-flash-image`) for AI Cataloging
- **Storage:** Cloudinary for robust image hosting

---

## 🌊 Application Flow

```mermaid
graph TD
    A[Weaver/Cooperative] -->|Uploads Raw Photos| B(LoomMitra App)
    B -->|Triggers AI Engine| C{Google Gemini AI}
    C -->|Generates Catalog| D[Cloudinary Storage]
    D --> B
    B -->|Mints Digital Passport| E[(PostgreSQL / Blockchain Layer)]
    E -->|Generates QR Code| F[Physical Product Tag]
    
    G[Customer / Business] -->|Scans QR| H(Authenticity Portal)
    H -->|Views Story & Data| E
    G -->|Browses Marketplace| I(LoomMitra Web/Mobile)
    I -->|Buys Retail or Requests Bulk| B
```

### Role-Based Flows
1. **Weaver (Maker):** Registers -> Creates Draft Product -> Uploads Raw Pics -> Generates AI Catalog -> Publishes -> Receives Orders -> Updates Status.
2. **Business (B2B):** Browses Marketplace -> Requests Bulk Quote (RFQ) -> Negotiates -> Finalizes Order.
3. **Customer (B2C):** Browses Marketplace -> Adds to Cart -> Checkout -> Scans QR upon delivery for authenticity.

---

## 🤖 AI Catalog Generation Details

LoomMitra automatically generates professional e-commerce catalog photos from raw product images to save weavers thousands of rupees in photography costs.

1. **Plan:** The system creates a 5-shot plan (Model Front, Model Side, Hanger, Texture Close-up, Border Close-up).
2. **Auto-style:** Selects a styling prompt based on product details (e.g., festive, casual).
3. **Generate:** Shots are sequentially generated using `gemini-2.5-flash-image` with the raw photo as a reference.
4. **Upload:** Images are stored on Cloudinary.
5. **Live Progress:** Real-time polling updates the weaver's dashboard as each image completes.

---

## 💻 Local Development

### 1. Backend Setup
```bash
cd server
npm install

# Set your .env variables
# DATABASE_URL=postgresql://user:password@host:port/dbname
# JWT_SECRET=your_secret
# CLOUDINARY_*=your_keys
# GEMINI_API_KEY=your_key

npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### 2. Web Frontend Setup
```bash
cd app
npm install
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:4000" > .env.local
npm run dev
```

### 3. Mobile App Setup
```bash
cd mobile
npm install
# Ensure Expo CLI is installed
npx expo start
```

---

## 🗺️ Roadmap

- [x] **AI Catalog Generation:** One-click studio photos.
- [x] **Mobile App Scanner:** Native QR scanning for instant authenticity verification.
- [x] **B2B Bulk Orders:** Dedicated RFQ flows for businesses.
- [ ] **On-Chain Blockchain:** Migrating the hash-chained PostgreSQL logs to a public ledger (Polygon) for immutable trust.
- [ ] **Multi-Language Support:** Regional languages (Hindi, Telugu, Bengali) for true grassroots adoption.
- [ ] **Logistics Integration:** Partnering with India Post for direct village-to-city shipping.

---

## 🏆 Acknowledgements

- **India's handloom weavers and cooperatives** — the true artists and the core inspiration behind this platform.
- **Handloom Hackathon 2026** — for providing the platform to bridge technology with tradition. 
- The vibrant open-source communities powering Next.js, React Native, Prisma, and Tailwind.

<br>
<p align="center"><em>LoomMitra — Woven with care for the people who weave.</em></p>
