# Troubleshooting Runbook (Ops) 🔧

This runbook acts as a swift guide for System Administrators (SysAdmins) to diagnose and fix production issues with the Next.js Schedule Dashboard.

---

## 🛑 Scenario 1: The Screen Shows a Red "DB ERROR" Banner

### What it means
The Next.js Application Server is running properly, but it completely failed to pull the latest JSON payload from the Microsoft SQL Server. The Application catches this and prevents the screen from crashing gracefully.

### How to diagnose
Check the deployment terminal logs (e.g., `pm2 logs schedule-dashboard` or Docker container logs).
You will see: `[Schedule API] Unhandled error: [RAW ERROR STACK]`.

**Solutions:**
1. **Node to MSSQL Network Drops**: Check if the firewall is blocking port `1433` from the Dashboard Hosting VM to the `DB_SERVER` IP.
2. **Invalid Setup**: Verify the `.env` has the correct `DB_PASSWORD`. Special characters (like `$`) in passwords often break generic strings.
3. **MSSQL View Missing**: If the DBA deleted or renamed the View mapped in `lib/constants.ts` (e.g. `APP_SCHEDULE_P2...`), the query will immediately crash with an "Object not found" Error.
4. **Database is Offline**: Notify your DBA team. When the DB comes back online, the dashboard will **automatically recover within 5 minutes** without needing a manual restart.

---

## 🧊 Scenario 2: The Screen Stops Auto-Scrolling

### What it means
A browser-level event has mistakenly paused the Javascript `requestAnimationFrame` loop, or the component believes the user is still interacting with it.

### Solutions
1. Move the mouse cursor completely out of the webpage window (offscreen). The `onMouseLeave` event should resume scrolling.
2. Ensure there is no invisible software overlay (e.g. anti-virus prompts, teamviewer panels) hovering on top of the dashboard causing false `onMouseEnter` triggers.
3. If on a TV, tap the screen randomly and drag down, then let go. This forces a release of `isDraggingRef.current`.

---

## 🐌 Scenario 3: Memory Leaks / Browser Gets Extremely Slow Over Days

### What it means
The browser tab has slowly exhausted RAM over 72 hours of continuous running due to rendering bugs inside Chromium or Edge.

### Solutions
This should never happen because `app/layout.tsx` is specifically designed with:
```html
<meta httpEquiv="refresh" content="PAGE_REFRESH_SECONDS" />
```
*(If you have swapped this to Next's `router.refresh()` in client components, RAM accumulation on cheap TVs is still possible after 3-4 days).*

**Fix Strategy for Kiosk browsers:**
Use a Kiosk OS (e.g. ChromeOS Flex or Porteus Kiosk) that natively reboots the active browser process entirely every 24 hours (e.g. at 2:00 AM) to permanently sidestep chromium memory bloat bounds.

---

## 🛠️ Scenario 4: A Job Appears in "Tomorrow" Instead of "Today"

### What it means
Date calculations have gone wrong, likely due to unexpected timezone differences.

### Solutions
1. Next.js uses standard Node.js server time. Ensure the Host VM running this Application has its Timezone set correctly to `Asia/Jakarta` (or your target local timezone).
2. Look at the `toDateInt()` and `mssqlDateToInt()` logic in `route.ts`. All date calculations bypass local server offsets and strictly extract the string (`YYYY-MM-DD`). 
3. Check if the raw data in MSSQL `[Due Date]` already holds the wrong target day. 
