'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Client component — triggers an immediate full page reload (= manual sync now).
 * Shows a spinning state while the page is reloading.
 */
export function SyncNowButton() {
    const [syncing, setSyncing] = useState(false);

    const handleSync = () => {
        setSyncing(true);
        window.location.reload();
    };

    return (
        <button
            onClick={handleSync}
            disabled={syncing}
            aria-label="Sync data now"
            className={`
                flex flex-col items-center justify-center gap-1
                bg-slate-900 border border-slate-700 hover:border-emerald-500
                px-3 sm:px-5 py-2 sm:py-3 rounded-xl
                transition-all duration-200 cursor-pointer
                hover:bg-emerald-950/40 active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed
                group
            `}
        >
            <span className="text-slate-400 group-hover:text-emerald-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors">
                SYNC DATA NOW
            </span>
            <RefreshCw
                className={`w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-emerald-400 transition-colors ${syncing ? 'animate-spin text-emerald-400' : ''}`}
                aria-hidden="true"
            />
        </button>
    );
}
