import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { DbScheduleRow, JobCategory, JobItem, DashboardData } from '@/lib/types';
import { APP_TIMEZONE, API_REVALIDATE_SECONDS, DB_VIEWS, EXCLUDED_STATUSES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

// ─── SQL Columns ──────────────────────────────────────────────────────────────
// Defined once to avoid duplication between the two view queries.
const SELECT_COLUMNS = `
    [No.] as No,
    [Status] as Status,
    [Source No.] as SourceNo,
    [Routing No.] as RoutingNo,
    [Starting Date] as StartingDate,
    [Ending Date] as EndingDate,
    [Due Date] as DueDate,
    [Location Code] as LocationCode,
    [Remark] as Remark,
    [Demand Source ID] as DemandSourceID,
    [Order Date] as OrderDate,
    [Lead Time in Days] as LeadTimeDays,
    [Quantity] as Quantity,
    [Item Description] as ItemDescription,
    [Creation Date] as CreationDate,
    [Last Date Modified] as LastDateModified
`.trim();

// ─── Date Helpers ─────────────────────────────────────────────────────────────
/** Returns a YYYYMMDD integer for a given Date in the app timezone. */
function toDateInt(d: Date, timeZone: string): number {
    const str = new Intl.DateTimeFormat('en-CA', { timeZone }).format(d);
    return parseInt(str.replace(/-/g, ''), 10);
}

/** Parses a MSSQL UTC-midnight Date to a YYYYMMDD integer directly from its ISO string. */
function mssqlDateToInt(d: Date): number {
    const iso = d.toISOString().split('T')[0]; // "2026-02-23"
    return parseInt(iso.replace(/-/g, ''), 10);
}

// ─── Business Logic ───────────────────────────────────────────────────────────
/**
 * Categorises job rows into overdue / today / tomorrow buckets.
 * All date comparisons use YYYYMMDD integers to avoid timezone drift.
 */
function categorizeJobs(rows: DbScheduleRow[]): JobCategory {
    const overdue: JobItem[] = [];
    const today: JobItem[] = [];
    const tomorrow: JobItem[] = [];

    const now = new Date();
    const todayInt = toDateInt(now, APP_TIMEZONE);
    const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(now);

    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowInt = toDateInt(tomorrowDate, APP_TIMEZONE);

    const excludedSet = new Set<string>(EXCLUDED_STATUSES);

    for (const row of rows) {
        if (excludedSet.has(row.Status)) continue;

        const dueDateRaw = row.DueDate;
        const dueInt = dueDateRaw ? mssqlDateToInt(dueDateRaw) : 0;

        const item: JobItem = {
            no: String(row.No || ''),
            status: row.Status || 'N/A',
            sourceNo: row.SourceNo || '',
            routingNo: row.RoutingNo || '',
            startingDate: row.StartingDate ? row.StartingDate.toISOString() : '',
            endingDate: row.EndingDate ? row.EndingDate.toISOString() : '',
            dueDate: dueDateRaw ? dueDateRaw.toISOString() : '',
            locationCode: row.LocationCode || 'N/A',
            remark: row.Remark || '',
            demandSourceID: row.DemandSourceID || '',
            orderDate: row.OrderDate ? row.OrderDate.toISOString() : '',
            leadTimeDays: row.LeadTimeDays ?? null,
            quantity: row.Quantity ?? null,
            itemDescription: row.ItemDescription || '',
            creationDate: row.CreationDate ? row.CreationDate.toISOString() : '',
            lastDateModified: row.LastDateModified ? row.LastDateModified.toISOString() : '',
        };

        if (dueInt < todayInt) {
            if (dueDateRaw) {
                const [ty, tm, td] = todayStr.split('-').map(Number);
                const dueIso = dueDateRaw.toISOString().split('T')[0];
                const [dy, dm, dd] = dueIso.split('-').map(Number);
                const msToday = Date.UTC(ty, tm - 1, td);
                const msDue = Date.UTC(dy, dm - 1, dd);
                item.overdueDays = Math.floor((msToday - msDue) / 86_400_000);
            }
            overdue.push(item);
        } else if (dueInt === todayInt) {
            today.push(item);
        } else if (dueInt === tomorrowInt) {
            tomorrow.push(item);
        }
    }

    return { overdue, today, tomorrow };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET() {
    try {
        const pool = await getConnection();

        const [rfResult, mixResult] = await Promise.all([
            pool.request().query<DbScheduleRow>(
                `SELECT ${SELECT_COLUMNS} FROM ${DB_VIEWS.RELABEL_FILLING}`
            ),
            pool.request().query<DbScheduleRow>(
                `SELECT ${SELECT_COLUMNS} FROM ${DB_VIEWS.MIXING}`
            ),
        ]);

        const data: DashboardData = {
            relabelFilling: categorizeJobs(rfResult.recordset),
            mixing: categorizeJobs(mixResult.recordset),
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(data);
    } catch (error: unknown) {
        // Log the full error server-side for diagnostics
        console.error('[Schedule API] Unhandled error:', error);

        // Return a sanitized message to the client — never expose raw DB errors
        const isKnownError = error instanceof Error;
        const clientMessage = isKnownError && isClientSafeError(error.message)
            ? error.message
            : 'Database unavailable. Please contact your system administrator.';

        return NextResponse.json({ error: clientMessage }, { status: 503 });
    }
}

/**
 * Determines whether an error message is safe to expose to the browser.
 * Prevents DB schema, credentials, or server info from leaking to clients.
 */
function isClientSafeError(msg: string): boolean {
    const sensitivePatterns = [/password/i, /login/i, /user/i, /server/i, /tcp/i, /elogin/i];
    return !sensitivePatterns.some((re) => re.test(msg));
}
