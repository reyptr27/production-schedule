# System Architecture

This application is built entirely on the **Next.js 14 App Router** paradigm. It leverages Server-Side React components for heavy database fetching and security, while surgically embedding Client Components for interactivity.

## 1. High-Level Flow 🔄

\`\`\`mermaid
sequenceDiagram
    participant Browser
    participant NextJS_Server
    participant MSSQL_Database

    Note over Browser, NextJS_Server: Automatic Refresh every 5 min
    Browser->>NextJS_Server: router.refresh() (fetch /)
    NextJS_Server->>NextJS_Server: Execute DashboardPage (Server Component)
    NextJS_Server->>NextJS_Server: Call getScheduleData() -> fetch(/api/schedule)
    NextJS_Server->>MSSQL_Database: Query RELABEL & MIXING Views
    MSSQL_Database-->>NextJS_Server: Return raw payload
    NextJS_Server->>NextJS_Server: categorizeJobs() mapping
    NextJS_Server-->>Browser: Stream serialized React Server Component HTML
    Note over Browser: DOM updates seamlessly (no full page reload)
\`\`\`

## 2. Server Components vs Client Components ⚛️

### Server Components (The Backbone)
- \`app/page.tsx\`: The entry point. It fetches data on the server side using the built-in \`fetch()\` API with caching disabled. It never exposes database logic to the client.
- \`app/api/schedule/route.ts\`: Acts as a secure intermediary layer. It connects to the database, pulls from views, filters out excluded statuses, maps the MSSQL rows to TypeScript \`JobItem\` objects, calculates exact overdue days, and groups results into Overdue, Today, and Tomorrow.

### Client Components (The Interactions)
- \`components/dashboard/AutoScroller.tsx\`: Takes over the DOM element and scrolls it using highly optimized \`requestAnimationFrame\`.
- \`components/dashboard/AutoRefresher.tsx\`: Injects a background setInterval that uses \`useRouter().refresh()\` to keep the screen fresh without disruptive \`window.location.reload()\` flickers.
- \`components/dashboard/CountdownTimer.tsx\`: Reacts to the \`lastUpdated\` timestamp to calculate remaining seconds until the next automatic data sync.

## 3. The Caching & Revalidation Strategy 🛡️

To prevent the MSSQL server from being bombarded by thousands of queries (e.g. if the user repeatedly spams F5 or holds down the reload button), the application is intentionally designed with:

* **Dynamic Forcing**: The API route sets \`export const dynamic = 'force-dynamic'\` so that manual "SYNC DATA NOW" requests instantly hit the database without looking at stale cache states.
* **Smart UI Syncing**: The \`AutoRefresher\` client component orchestrates the automatic API calls explicitly on a 5-minute interval. This way, the dashboard only touches the database exactly when it is meant to.

## 4. UI/UX "Industrial Display" Optimizations 🖥️

Because this application lives on factory floor monitors:
* **No Scrollbars**: \`-ms-overflow-style: none\` and \`::-webkit-scrollbar { display: none }\` block ugly UI chrome.
* **Auto-Scrolling**: Vertical space is limited. The system slowly drags the content upward, pausing intelligently at the top and bottom to let viewers digest the queue.
* **Hover to Pause**: If a manager walks by and wishes to read a specific job card, they only need to hover a mouse or touch the glass overlay. The \`AutoScroller\` tracks \`mouseenter\` events and halts the requestAnimationFrame loop immediately.
