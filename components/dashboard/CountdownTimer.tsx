'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { API_REVALIDATE_SECONDS } from '@/lib/constants';

interface CountdownTimerProps {
    /** ISO string of when data was last fetched from the DB (from API response). */
    lastUpdated: string;
}

/**
 * Client component — shows a live countdown (MM:SS) to the next automatic
 * data sync. Once it hits 00:00 the browser meta-refresh fires and the page
 * reloads with fresh data from the API cache.
 */
export function CountdownTimer({ lastUpdated }: CountdownTimerProps) {
    const [remaining, setRemaining] = useState<number | null>(null);

    useEffect(() => {
        const lastMs = new Date(lastUpdated).getTime();

        const compute = () => {
            const elapsed = Math.floor((Date.now() - lastMs) / 1000);
            const left = Math.max(0, API_REVALIDATE_SECONDS - elapsed);
            setRemaining(left);
        };

        compute(); // run immediately — avoid 1-second flash of null
        const id = setInterval(compute, 1000);
        return () => clearInterval(id);
    }, [lastUpdated]);

    // Format seconds → MM:SS
    const format = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    const isUrgent = remaining !== null && remaining <= 30;

    return (
        <div className="flex flex-col items-end bg-slate-900 border border-slate-700 px-3 sm:px-5 py-2 sm:py-3 rounded-xl">
            <span className="text-slate-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-0.5 flex items-center gap-1">
                {/* <RefreshCw
                    className={`w-3 h-3 ${isUrgent ? 'text-amber-400 animate-spin' : 'text-slate-500'}`}
                    aria-hidden="true"
                /> */}
                NEXT DATA SYNC
            </span>
            <span
                className={`text-lg sm:text-2xl font-mono font-black tabular-nums transition-colors duration-300 ${remaining === null
                    ? 'text-slate-600'
                    : isUrgent
                        ? 'text-amber-400 animate-pulse'
                        : 'text-slate-300'
                    }`}
                aria-live="polite"
                aria-label={remaining !== null ? `Next sync in ${format(remaining)}` : 'Calculating'}
            >
                {remaining !== null ? format(remaining) : '--:--'}
            </span>
        </div>
    );
}
