import Image from 'next/image';
import { ClockAlert } from 'lucide-react';
import { DashboardData } from '@/lib/types';
import { formatTime, formatTodayDisplay } from '@/lib/formatters';
import { CountdownTimer } from './CountdownTimer';
import { SyncNowButton } from './SyncNowButton';

interface DashboardHeaderProps {
    data: DashboardData | null;
    errorMsg: string | null;
}

/**
 * Top navigation header.
 * Renders the company logo, app title, and status widgets (Today / Last Sync).
 * Shows a red error banner instead of status widgets when data fetch has failed.
 */
export function DashboardHeader({ data, errorMsg }: DashboardHeaderProps) {
    return (
        <header
            className="shrink-0 bg-slate-950 border-b-2 border-slate-800 flex justify-between items-center px-4 sm:px-8 py-3 sm:py-0 sm:h-[88px] shadow-2xl z-20 gap-4"
            role="banner"
        >
            {/* ── Brand ── */}
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <div className="flex items-center justify-center shrink-0">
                    <Image
                        src="/hertz-logo.png"
                        alt="Hertz logo"
                        width={500}
                        height={250}
                        className="w-auto h-8 sm:h-12 object-contain"
                        priority
                    />
                </div>
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-black tracking-widest text-slate-100 uppercase truncate">
                        PRODUCTION SCHEDULE
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-mono font-bold tracking-wider mt-0.5 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" aria-hidden="true" />
                        LIVE STATUS MONITOR - AUTO REFRESH 5 MIN
                    </p>
                </div>
            </div>

            {/* ── Status Widgets ── */}
            {errorMsg ? (
                <div
                    className="flex items-center gap-3 bg-red-950/80 border border-red-700 px-3 sm:px-5 py-2 sm:py-3 rounded-xl shrink-0"
                    role="alert"
                    aria-live="assertive"
                >
                    <ClockAlert className="w-6 h-6 sm:w-7 sm:h-7 text-red-400 animate-pulse shrink-0" aria-hidden="true" />
                    <span className="text-red-200 font-bold text-sm sm:text-lg uppercase tracking-wider">
                        DB ERROR
                    </span>
                </div>
            ) : data && (
                <div className="flex gap-2 sm:gap-4 shrink-0 items-stretch">
                    <StatusWidget label="TODAY" value={formatTodayDisplay()} valueClass="text-slate-100" />
                    <StatusWidget label="LAST DATA SYNC" value={formatTime(data.lastUpdated)} valueClass="text-emerald-400" />
                    <CountdownTimer lastUpdated={data.lastUpdated} />
                    <SyncNowButton />
                </div>
            )}
        </header>
    );
}

// ─── Private sub-component ────────────────────────────────────────────────────
function StatusWidget({
    label,
    value,
    valueClass,
}: {
    label: string;
    value: string;
    valueClass: string;
}) {
    return (
        <div className="flex flex-col items-end bg-slate-900 border border-slate-700 px-3 sm:px-5 py-2 sm:py-3 rounded-xl">
            <span className="text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-0.5">
                {label}
            </span>
            <span className={`text-lg sm:text-2xl font-mono font-black ${valueClass}`}>
                {value}
            </span>
        </div>
    );
}
