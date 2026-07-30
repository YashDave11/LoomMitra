# LoomMitra Mobile (Android)

React Native (Expo) app for the LoomMitra handloom marketplace — weaver
listing wizard, marketplace browsing, cart, and the auction house, sharing
types, API client, product options, and translations with the web app.

## Stack

- **Expo SDK 51** + **React Native 0.74** + **TypeScript (strict)**
- **Expo Router** — file-based navigation (mirrors the web `/app` routes)
- **react-i18next** — same locale files as the web app (`/locales` at repo root)
- **React Context** — auth + cart (ported from the web app)
- **expo-secure-store** — JWT storage; **AsyncStorage** — cart + language
- **expo-image-picker** — camera/gallery for the listing wizard
- **lucide-react-native** — same icon set as web

## Project layout

```
mobile/
  app/                    # Expo Router routes
    _layout.tsx           # providers (i18n, auth, cart) + root stack
    index.tsx             # entry gate: splash → login or role dashboard
    (auth)/               # login, register
    (weaver)/             # weaver tab shell: dashboard, products, auctions, profile
    (customer)/           # customer tab shell: browse, auctions, cart, profile
    product/new.tsx       # one-question-at-a-time listing wizard
    product/[id].tsx      # product detail (role-aware)
    auction/new.tsx       # create auction
    auction/[id].tsx      # auction detail + live bidding
  src/
    components/ui/        # design system: Button, Card, OptionCard, Chip, Input,
                          # Header, ProgressBar, Badge, Screen, state components
    components/domain/    # ProductCard, AuctionCard, StatCard, ImageUploader,
                          # LanguageSwitcher
    features/wizard/      # data-driven wizard step config (voice-ready)
    lib/                  # types, apiClient, productOptions, contexts, i18n, format
    theme/                # spacing / typography / color / radius / touch tokens
```

Translations load directly from the repo-root `/locales` via Metro
`watchFolders` — one source of truth with the web app.

## Run locally

Prereqs: Node 18+, an Android device with the **Expo Go** app (or an Android
emulator), and the backend running (`cd server && npm run dev`).

```bash
cd mobile
npm install

# Point the app at your backend. On a physical device use your machine's
# LAN IP, not localhost:
cp .env.example .env
# edit .env → EXPO_PUBLIC_BACKEND_URL=http://<your-lan-ip>:4000

npm run android    # or: npm start, then scan the QR with Expo Go
```

Typecheck: `npm run typecheck`

## Notes

- **Voice-ready**: the wizard is pure step config (`src/features/wizard/steps.ts`);
  a voice-fill button only needs the current step's `{ field, type, options }`.
- **Low-literacy UX**: one question per screen, ≥48dp touch targets, icon +
  swatch cues, auto-advance on choice taps.
- Checkout, orders list, and bulk-order (RFQ) screens are not yet ported —
  the API client already covers them, so they are screen-only additions.
