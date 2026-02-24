# Database Schema & Networking 🏦

The application uses Microsoft SQL Server (`mssql` NPM driver).

## 1. Connection Pooling (`lib/db.ts`)
To prevent exhausting the MSSQL server connections with thousands of Next.js serverless invocations, the application uses a singleton connection pool.
* **Pool Configuration**: `max: 10, min: 2, idleTimeoutMillis: 30000`.
* **Security Options**: `encrypt: false, trustServerCertificate: true` are hardcoded to accept local un-encrypted LAN database connections. The application depends on standard firewalls for protection, as is common inside isolated factory networks.

## 2. API Data Parsing (`app/api/schedule/route.ts`)

Instead of throwing unescaped SQL results at the client side, the server formats, strips down, and mathematically categorizes rows inside Node.js.

### Target Views
1. `APP_SCHEDULE_P2_PRODMGR` (Mixing)
2. `APP_SCHEDULE_P2_PRODMGR_FILLING` (Relabel/Filling)

### Date Normalization (CRITICAL)
Dates inside MSSQL often lack explicit timezone flags. If Naive MSSQL Date objects are passed into JavaScript's `new Date()`, the JS Engine interprets them as UTC-Midnight. When viewed from Asia/Jakarta (GMT+7), "Tomorrow Midnight" can magically slide backwards into "Today 5:00 PM."

**The Fix:**
The API splits MSSQL ISO Date strings via `.split('T')[0]` to isolate strictly `YYYY-MM-DD`. These are mathematically converted back to precise absolute UTC Unix Timeframes for checking "Is this due date smaller than Today's 12:00 AM timestamp?". 
This guarantees a job is grouped into Today/Tomorrow/Overdue independently of any random timezone server drift.

## 3. Ignored Statuses
Tickets with statuses of `Planned` or `Finished` are deliberately filtered out inside the server route before the JSON payload is dispatched to the dashboard.

## 4. Exposed vs Protected Types
* **`DbScheduleRow`:** Matches exactly what the SQL View `SELECT` query returns.
* **`JobItem`:** An explicitly defined interface representing the perfectly sanitized, flattened string/number variables that are safely sent to `components/dashboard/JobCard.tsx`. Node.js strips all prototype and raw MSSQL Date objects from here. 

This strict separation guarantees that the Browser never touches nor views internal DB typings.
