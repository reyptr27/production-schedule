# Component Guide 🧩

This application heavily utilizes Tailwind CSS for industrial-style theming.

## 1. DashboardLayout (app/layout.tsx)
The master wrapper. Instantiates the \`<AutoRefresher>\` client component that forces a data sync every 5 minutes. It hides scrollbars, sets the dark root theme, and enforces \`font-display: optional\` to guarantee lightning-fast LCP metrics in Lighthouse.

## 2. DashboardHeader
A non-scrollable sticky header.
- **Top Left**: Displays the Hertz logo and "LIVE STATUS MONITOR" pulsing indicator.
- **Top Right**: Incorporates \`StatusWidget\`s showing current data sync time and the \`CountdownTimer\`. It also holds the manual \`<SyncNowButton>\`.
- **Error State**: Automatically renders a red siren box when \`errorMsg\` from the database fetch is present.

## 3. Column
A flex container taking 50% screen width (or 100% on mobile). It receives an array of \`JobCategory\` data and a \`theme\` (amber/blue). It maps out three distinct \`Section\` components: Overdue (forcing urgency mode on), Today, and Tomorrow.

## 4. Section
Groups an array of \`JobItems\` under a bold, colored title.
- If \`jobs.length === 0\`, it still gracefully renders an empty status state with an ARIA-compliant \`role="listitem"\` to appease screen reader validators.
- Relies on \`JobCard\` components internally to display actual tickets.

## 5. JobCard
The workhorse. A flex-heavy, carefully padded rectangle that visually displays:
- **Routing & Item Description**: Emphasized in strong white text.
- **Badges**: Distinct Location Codes and "DAYS OVERDUE" warning badges locked into the top-right corner.
- **Dates**: Consolidated `Created`, `Start`, `End`, and `Due` date indicators spanning a single horizontal row for scannability.
- **Quantities vs Weights**: Automatically converts Grams (if detected via the metadata properties) into Kilograms and clearly labels the numerical display.

## 6. AutoScroller
A pure-client mechanism wrapped around standard \`overflow-y-auto\` div contents.
See `architecture.md` for performance optimizations involving layout thrashing prevention during the \`requestAnimationFrame\` lifecycle.
