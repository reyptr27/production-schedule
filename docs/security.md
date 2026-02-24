# Security & Compliance 🔒

For an enterprise internal tool, security extends beyond normal web-defense. Internal networks are trusted but still require isolation layers (Zero Trust model compliance).

## 1. Data Obfuscation & Error Handling
**The Goal:** Prevent a database crash from leaking sensitive internal network maps or schema names to screen monitors or unauthorized employees.

**How it works (`route.ts`):** 
```typescript
function isClientSafeError(msg: string): boolean {
    const sensitivePatterns = [/password/i, /login/i, /user/i, /server/i, /tcp/i, /elogin/i];
    return !sensitivePatterns.some((re) => re.test(msg));
}
```
If the Connection Pool crashes because of a wrongly configured `.env` password, the server does **not** forward `Login Failed for user...` to the Dashboard. It catches the trace, logs the real error to the secure Node.js console (for SysAdmins), and returns a sanitized `503 Service Unavailable` JSON response.

## 2. Content Security Policy (CSP) & Headers

To protect the application from XSS (Cross-Site Scripting) and clickjacking, we manipulate HTTP headers on every request via `next.config.mjs`.

- `X-Frame-Options: DENY`: Prevents this dashboard from being secretly embedded in an unauthorized `<iframe>` elsewhere.
- `X-Content-Type-Options: nosniff`: Prevents browsers from incorrectly executing non-JS files masquerading as JS.
- **Strict Content Security Policy (CSP):**
```javascript
"default-src 'self'",
"script-src 'self' 'unsafe-eval' 'unsafe-inline'", // required for Next.js reactivity
"style-src 'self' 'unsafe-inline'", // required for Tailwind Critters
"img-src 'self' data: blob:", // allowed for Next.js <Image> rendering
"connect-src 'self'", // restricts browser from making fetch() calls to anywhere except its own API
```
If a rogue user connects a keyboard to the factory monitor and attempts to run a malicious script in the DevTools to exfiltrate database data to an external server, the browser will strictly block the `fetch` due to the CSP rules.

## 3. Database Connection Security

- **Connection Pool**: Limits connections to a hard maximum (`max: 10`). This protects the core MSSQL server from being DDOS'd by the Dashboard if a network loop occurs.
- **TrustServerCertificate**: Explicitly set to `true`. This assumes the local factory layer network is heavily firewalled and encrypted traffic to the DB isn't strictly required, saving CPU cycles on older hardware.

**Enterprise Checklist:** Always ensure that `DB_USER` in your `.env` only has `db_datareader` (SELECT) rights on the specific `APP_SCHEDULE_P2` Views. It **must not** have UPDATE or DELETE permissions.
