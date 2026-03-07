# QueueLess India 🇮🇳
> *No Line, Just Arrive.* A premium, AI-powered smart queue management platform.

![QueueLess Application Banner](https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop)

QueueLess India is a modern SaaS platform designed to eliminate physical waiting lines in high-density venues like Hospitals, Banks, Salons, and Government Offices. Built with a mobile-first philosophy, it leverages WebGL 3D Spatial concepts, real-time Supabase sync, and AI predictive wait-time models.

---

## 🌟 Key Features

### B2C Customer Marketplace App
- **Live Discovery Map**: Browse real-time wait times of nearby businesses via `react-leaflet`.
- **Smart Queue Tracking**: Live token status tracking with dynamic ETA calculations.
- **Smart Arrival Window**: Informs customers exactly when to arrive (`ETA +/- 5 mins`) to avoid overcrowding lobbies.
- **Fast Pass Purchases**: Pay a premium to expedite your turn natively via an integrated booking flow.
- **Geo-Fence Guard**: Warns remote users before purchasing a Fast Pass if they are deemed too far away (>5km).
- **Viral Engagement Loops**: 
  - **Live Queue Pulse**: Animated marquee showing live token activity across the city.
  - **Live Leaderboard**: Tracks the most efficient businesses and volume of customers served today.
  - **AI Best Time to Visit**: Explores historical data to predict the optimal time and wait-time expected.

### B2B Business SaaS Dashboard
- **Admin Command Center**: Complete control over your queue. Call the next token, push a token to VIP, mark a user as a No-Show (`skipToken`), or `recallToken` if a user arrives late.
- **Digital TV Display Mode**: Generate a beautiful, public-facing waiting lobby screen url without extra hardware.
- **QR Code Generators**: High-resolution print-ready store QR Codes so walk-ins can scan and join.
- **Analytics Engine**: Real-time traffic estimations and Fast Pass revenue projections.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router) & React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS Modules
- **Animations:** Framer Motion + React Three Fiber (3D WebGL)
- **Database/Realtime:** Supabase (PostgreSQL + Realtime Sockets)
- **Map Engine:** Leaflet & OS Maps (`react-leaflet`)
- **Icons:** Lucide-React
- **Authentication:** Custom Supabase Context Providers

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) (v10+)
- A [Supabase](https://supabase.com/) Account

### 2. Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-jwt-anon-key
```

### 3. Installation
```bash
# Install all dependencies
npm install

# Run the development server
npm run dev
```

Navigate to `http://localhost:3000` to preview your local application.

---

## 🖥 Production Deployment

This project uses the Next.js `Turbopack` engine and is pre-configured and fully audited for **Vercel** deployment.

1. Create a new project in your Vercel Dashboard.
2. Link your GitHub repository containing the QueueLess codebase.
3. In the Vercel Environment Variables, inject your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Run `Deploy`.

The `package.json` and `next.config.mjs` are already optimized for `npm run build`. 
All TypeScript compilation warnings and dynamic UI components have been audited to bypass hydration errors and memory leaks. PWA support is also injected natively through `src/app/layout.tsx` and `public/manifest.json`.

---

### UI/UX Philosophy
The application adheres strictly to Apple's Human Interface Guidelines tailored for a modern SAAS aesthetic, utilizing heavy `glassmorphism`, strict safe-area-inset padding for deep physical notches (iOS/Android), and sub-atomic particle animations leveraging Three.js.
