'use client';

import { useEffect, useRef } from 'react';

interface AutoScrollerProps {
    children: React.ReactNode;
    /** Pixels per second for the downward scroll. Default: 40 */
    speed?: number;
    /** Milliseconds to pause at the bottom before jumping back to top. Default: 1500 */
    pauseAtBottom?: number;
    /** Milliseconds to pause at the top before starting the next scroll. Default: 800 */
    pauseAtTop?: number;
}

/**
 * Client component — wraps a scrollable container and automatically scrolls
 * it downward at a constant speed. When it reaches the bottom it snaps
 * instantly to the top (after a brief pause) and repeats indefinitely.
 *
 * Stops scrolling when the user hovers over the container, so they can read
 * individual cards without the content moving under their eyes.
 */
export function AutoScroller({
    children,
    speed = 40,
    pauseAtBottom = 2000,
    pauseAtTop = 1000,
}: AutoScrollerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const pauseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isPausedRef = useRef(false); // paused by hover

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let lastTs: number | null = null;
        let phase: 'scrolling' | 'paused-bottom' | 'paused-top' = 'paused-top';
        let remainder = 0;

        const clearTimers = () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (pauseRef.current) clearTimeout(pauseRef.current);
        };

        const startScrolling = () => {
            phase = 'scrolling';
            lastTs = null;
            remainder = 0;
            rafRef.current = requestAnimationFrame(tick);
        };

        const tick = (ts: number) => {
            if (!el) return;

            if (isPausedRef.current) {
                // User is hovering — freeze, check again next frame
                lastTs = null;
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            if (lastTs === null) {
                lastTs = ts;
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            const delta = ts - lastTs;
            lastTs = ts;

            const px = (speed * delta) / 1000 + remainder;
            const intPx = Math.floor(px); // Extract the whole pixels
            remainder = px - intPx;       // Save the fraction for next frame

            // Read phase: get all geometric properties first
            const currentScroll = el.scrollTop;
            const clientHeight = el.clientHeight;
            const scrollHeight = el.scrollHeight;

            if (intPx > 0) {
                // Write phase: update scrollTop
                el.scrollTop += intPx;
            }

            // Check using the read variables and the intended scroll amount
            const atBottom = currentScroll + intPx + clientHeight >= scrollHeight - 2;

            if (atBottom) {
                phase = 'paused-bottom';
                // Pause at bottom, then snap to top and wait, then scroll again
                pauseRef.current = setTimeout(() => {
                    el.scrollTop = 0;
                    phase = 'paused-top';
                    pauseRef.current = setTimeout(startScrolling, pauseAtTop);
                }, pauseAtBottom);
                return; // don't request next frame — setTimeout will resume
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        // Start after initial pause so the user can read before it moves
        pauseRef.current = setTimeout(startScrolling, pauseAtTop);

        return () => clearTimers();
    }, [speed, pauseAtBottom, pauseAtTop]);

    const isDraggingRef = useRef(false);
    const startYRef = useRef(0);
    const scrollTopRef = useRef(0);

    const handleMouseEnter = () => { isPausedRef.current = true; };
    const handleMouseLeave = () => {
        isPausedRef.current = false;
        isDraggingRef.current = false;
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        startYRef.current = e.pageY - containerRef.current!.offsetTop;
        scrollTopRef.current = containerRef.current!.scrollTop;
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageY - containerRef.current.offsetTop;
        const walk = (x - startYRef.current) * 2; // scroll-fast multiplier
        containerRef.current.scrollTop = scrollTopRef.current - walk;
    };

    return (
        <div
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="flex-1 overflow-y-auto px-4 py-4 thin-scrollbar select-none cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: 'auto' }} // We control scrolling manually
        >
            {children}
        </div>
    );
}
