# Tech Stack & Directory Structure 🏗️

This project was built using the modern React ecosystem, optimized specifically for reliability and zero-touch operation.

## 1. Technologies 🛠️

- **Framework**: `Next.js 14` (App Router)
  * Chosen for its server-first architecture. It protects database secrets and limits the JS payload sent to the browsers on the factory floor.
- **Language**: `TypeScript` (v5+)
  * Strongly typing the `DbScheduleRow` to `JobItem` prevents nasty runtime crashes when SQL views unexpectedly change or return `NULL` payloads.
- **Styling**: `Tailwind CSS` (v3.4+)
  * A utility-first CSS framework. It allows rapid prototyping of the industrial look (Slate, Amber, Emerald palettes) without writing custom CSS classes that rot over time.
- **Database Driver**: `mssql`
  * Microsoft's dedicated Node.js connection client. It manages secure connection pooling and parameterized queries seamlessly.
- **Icons**: `lucide-react`
  * Clean, lightweight, and tree-shakeable SVG icons.
- **Asset Optimization**: `sharp` & `critters`
  * Used internally by Next.js to aggressively crush image sizes and inline critical CSS payloads for instant rendering.

## 2. Directory Structure 📂

Here is what every folder does in the architecture:

```text
/
├── app/                  # Next.js App Router (The Pages & APIs)
│   ├── api/schedule/     # Server-Side API endpoints (SQL connectivity)
│   ├── globals.css       # Tailwind entry point + Font/LCP optimizations
│   ├── layout.tsx        # The "Root Shell" / HTML wrapper / Global Meta tags
│   └── page.tsx          # The Server Component Dashboard Screen 
|
├── components/           # UI Building Blocks
│   └── dashboard/        # Specialized tools just for the dashboard
│       ├── AutoRefresher.tsx    # Invisible client ping generator (5 min)
│       ├── AutoScroller.tsx     # 60fps Layout-Thrashing-proof DOM scroller
│       ├── Column.tsx           # The visual column wrapper (Mixing vs Relabel)
│       ├── CountdownTimer.tsx   # Reacts to API timestamps to show MM:SS
│       ├── DashboardHeader.tsx  # Top branding bar + Manual Sync utilities
│       ├── ErrorScreen.tsx      # Clean UI fallback if the DB burns down
│       ├── JobCard.tsx          # The single ticket rectangle
│       └── Section.tsx          # The Overdue/Today/Tomorrow grouping wrapper
|
├── docs/                 # System Documentation (You are reading this!)
|
├── lib/                  # Utilities & Helpers
│   ├── constants.ts      # Magic numbers (Timezones, Target Database Views, Refresh Rates)
│   ├── db.ts             # The SQL Connection Pool Singleton
│   ├── formatters.ts     # Pure functions for `1000g -> 1kg`, Date to `05:00`
│   └── types.ts          # Centralized TypeScript definitions for DB vs UI
|
├── public/               # Static assets directly served to the browser (e.g. Hertz Logo files)
|
├── .env                  # (DO NOT COMMIT) Secure connection strings and passwords
├── next.config.mjs       # Build tooling rules (Content-Security-Policy, Critical CSS)
├── package.json          # Node dependencies and npm scripts
└── tailwind.config.ts    # Design tokens and custom UI theme rules
```
