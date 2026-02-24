import sql from 'mssql';
import 'dotenv/config';
import { validateEnv } from './validators';

let _pool: sql.ConnectionPool | null = null;

/**
 * Returns a validated, self-healing SQL Server connection pool.
 *
 * Security:
 * - Credentials are sourced exclusively from validated environment variables.
 *   No credentials are ever hard-coded here.
 * - `encrypt: false` is intentional for internal LAN (no Internet exposure).
 *   Set to `true` and remove `trustServerCertificate` if deploying over WAN.
 *
 * Reliability:
 * - Pool is reused across requests in the same Node.js process lifecycle.
 * - A broken/closed pool is discarded and recreated automatically.
 * - Pool-level errors (e.g. network drop) reset the singleton so the next
 *   inbound request always gets a fresh pool.
 *
 * ⚠️  Do NOT import this in Edge Runtime (middleware / route handlers using
 * `runtime = 'edge'`). MSSQL is Node.js only.
 */
export async function getConnection(): Promise<sql.ConnectionPool> {
    // Reuse healthy pool
    if (_pool && _pool.connected) {
        return _pool;
    }

    // Tear down broken pool before rebuilding
    if (_pool) {
        try { await _pool.close(); } catch { /* suppress */ }
        _pool = null;
    }

    const env = validateEnv();

    const config: sql.config = {
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        server: env.DB_HOST,
        port: env.DB_PORT,
        pool: {
            max: 10,
            min: 1,
            idleTimeoutMillis: 30_000,
        },
        connectionTimeout: 15_000,
        requestTimeout: 30_000,
        options: {
            encrypt: false,                // Internal LAN — no TLS overhead needed
            trustServerCertificate: true,  // Allow self-signed certs on MSSQL
        },
    };

    const pool = new sql.ConnectionPool(config);

    pool.on('error', (err: Error) => {
        console.error('[DB] Pool error — will reconnect on next request:', err.message);
        _pool = null;
    });

    await pool.connect();
    console.info('[DB] Connection pool established to', env.DB_HOST);
    _pool = pool;
    return pool;
}
