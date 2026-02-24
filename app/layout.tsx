import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AutoRefresher } from '@/components/dashboard/AutoRefresher';

export const metadata: Metadata = {
    title: 'Production Schedule Dashboard | HFMI',
    description: 'Live manufacturing production schedule monitor — RELABEL & FILLING and MIXING lines.',
    other: {
        // Tell the browser to preconnect to itself (avoids DNS latency for same-origin API calls)
        'x-dns-prefetch-control': 'on',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="id" suppressHydrationWarning>
            <head>
                {/* Preload the page's own origin to speed up API fetch and asset loading */}
                <link rel="preconnect" href="/" />
                <link rel="dns-prefetch" href="/" />
            </head>
            <body suppressHydrationWarning className="antialiased">
                <AutoRefresher />
                {children}
            </body>
        </html>
    );
}
