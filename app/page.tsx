import { DashboardData } from '@/lib/types';
import { COLUMN_LABELS } from '@/lib/constants';
import { Column, DashboardHeader, ErrorScreen } from '@/components/dashboard';

// ─── Data Fetching ────────────────────────────────────────────────────────────
async function getScheduleData(): Promise<DashboardData> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/schedule`, {
        // No browser-side caching — the API route (revalidate=300) is the cache layer.
        cache: 'no-store',
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `API responded with status ${res.status}`);
    }

    return res.json() as Promise<DashboardData>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
/**
 * Server Component — data is fetched on the server on every browser request.
 * No client JS bundle cost for data fetching.
 * The page is intentionally thin: orchestration only, no business logic.
 */
export default async function DashboardPage() {
    let data: DashboardData | null = null;
    let errorMsg: string | null = null;

    try {
        data = await getScheduleData();
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unexpected error';
        console.error('[DashboardPage]', msg);
        // Show a generic message — raw API/DB errors are already sanitized in route.ts
        errorMsg = 'Unable to load production data.';
    }

    return (
        <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
            <DashboardHeader data={data} errorMsg={errorMsg} />

            {data ? (
                <main className="flex-1 flex flex-row overflow-hidden" role="main">
                    <Column title={COLUMN_LABELS.RELABEL_FILLING} category={data.relabelFilling} theme="amber" />
                    <Column title={COLUMN_LABELS.MIXING} category={data.mixing} theme="blue" />
                </main>
            ) : (
                <ErrorScreen message={errorMsg} />
            )}
        </div>
    );
}
