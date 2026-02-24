'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PAGE_REFRESH_SECONDS } from '@/lib/constants';

/**
 * Invisible client component that silently refreshes server data
 * every PAGE_REFRESH_SECONDS using Next.js router.refresh().
 *
 * Unlike <meta http-equiv="refresh">, this approach:
 * - Does NOT reload the full page
 * - Does NOT reset scroll position
 * - Does NOT move focus to top
 * - Re-fetches server components data only (no client state lost)
 */
export function AutoRefresher() {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, PAGE_REFRESH_SECONDS * 1000);

        return () => clearInterval(interval);
    }, [router]);

    return null; // Renders nothing — purely behavioural
}
