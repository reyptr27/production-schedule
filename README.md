# Live Production Schedule Dashboard 🏭

A modern, high-performance, and resilient digital signage dashboard designed to be displayed on 24/7 monitors across manufacturing floors. Built with **Next.js 14 (App Router)** and **Microsoft SQL Server**, this dashboard provides a real-time, zero-interaction view of the production queue for the RELABEL/FILLING and MIXING lines.

## ✨ Key Features

- **Live Database Syncing**: Fetches live manufacturing data directly from MSSQL Views via secure, server-side API routes.
- **Zero-Touch Operation**: Designed to be completely hands-free once launched.
- **Background Auto-Refresh**: Uses Next.js `router.refresh()` to fetch the latest data payload every 5 minutes without causing screen flicker, full page reloads, or scroll resets.
- **Smart Auto-Scroller**: Automatically scrolls long lists (like TODAY or TOMORROW queues) continuously so operators can read everything at a glance. It instantly pauses if a mouse hovers or touches the viewport to allow manual inspection.
- **Resilient & Crash-Proof**: Includes comprehensive Server-Side gracefully-handled error states ("DB ERROR") that prevent the UI from blowing up or exposing sensitive SQL traces if the network drops.
- **Highly Optimized Frontend**: Uses Tailwind CSS, `next/font`, Next.js `optimizeCss` (Critters payload tree-shaking), preconnect hints, and hardware acceleration hints to guarantee 99+ Lighthouse performance scores even on low-powered factory Intel NUCs or Raspberry Pis.

## 🛠 Tech Stack

- **Framework:** Next.js 14 App Router (React)
- **Styling:** Tailwind CSS + custom industrial aesthetic UI
- **Database:** MSSQL (`mssql` node driver) with Connection Pooling
- **Icons:** `lucide-react`
- **Image Optimization:** `sharp`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or later
- **npm**: `v9.x` or later 
- An active Microsoft SQL Server (on-prem or cloud) containing the required Production Views.

### 2. Environment Configuration
Create a `.env` file at the root of the project. Note: if your password contains special symbol like `$`, make sure to use exact string literal or escape it properly depending on your OS.

```env
# Server Info
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Database Configuration
DB_USER="your_db_username"
DB_PASSWORD="Your_Password_123!"
DB_SERVER="192.168.x.x"
DB_NAME="your_database_name"
DB_PORT="1433" # Optional, defaults to 1433
```

### 3. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 4. Development Server
Run the local development environment:
```bash
npm run dev
```
Navigate to `http://localhost:3000`. 
*Note: In Dev mode, React Strict Mode and Hot Module Replacement (HMR) are active. Auto-scrolling and Next.js CSS rendering may behave slightly differently.*

### 5. Production Build (Recommended for Live Deploy)
To experience the true blazing-fast performance without development overhead:
```bash
npm run build
npm start
```
The server will start locally and serve the highly-optimized static & dynamic compiled assets.

---

## 🏗 Architecture Details

* **Server Component Architecture**: The main `DashboardPage` is strictly a Server Component that runs securely on your Node host. The DOM tree is shipped as pure HTML. Only small, atomic islands of interactivity (like `AutoScroller.tsx`, `AutoRefresher.tsx`, `CountdownTimer.tsx`) are shipped to the browser as Client Components to keep the JS payload minimal.
* **Component-Level Caching Disabled**: Setting `dynamic = 'force-dynamic'` on the `/api/schedule` ensures that operations always bypass Next.js static asset caching, ensuring that operators pressing "SYNC NOW" hit the database immediately.
* **Date Handling Intricacies**: All date math is performed by coercing dates into precise `YYYYMMDD` integer values bound to the `Asia/Jakarta` timezone. This eliminates nasty timezone drift bugs where a "Today" job accidentally slips into "Tomorrow."

## 📄 License
This system is an internal tool developed for HFMI usage. All rights reserved.
