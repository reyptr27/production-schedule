/**
 * Pure formatting utilities — no React, no side-effects.
 * These can be safely unit-tested in isolation.
 */

import { GRAMS_PER_KG, APP_TIMEZONE } from './constants';

/**
 * Formats an ISO date string into a human-readable localised date.
 * Returns '—' for empty/null input (to prevent blank cells in the UI).
 */
export function formatDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
}

/**
 * Formats a time string (HH.MM.SS from id-ID locale) into HH:MM:SS
 * using colon separators, as expected by the production floor monitors.
 */
export function formatTime(iso: string | Date | null | undefined): string {
    if (!iso) return '—';
    try {
        return new Date(iso)
            .toLocaleTimeString('id-ID', { hour12: false, timeZone: APP_TIMEZONE })
            .replace(/\./g, ':');
    } catch {
        return '—';
    }
}

/**
 * Converts grams (DB storage unit) to kilograms for display.
 * Returns null if quantity is null.
 */
export function gramsToKg(grams: number | null): string | null {
    if (grams == null) return null;
    return (grams / GRAMS_PER_KG).toLocaleString('id-ID', {
        maximumFractionDigits: 2,
    });
}

/**
 * Formats today's date in uppercase Indonesian short-month format.
 * e.g., "23 FEB 2026"
 */
export function formatTodayDisplay(timezone: string = APP_TIMEZONE): string {
    return new Date()
        .toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone: timezone,
        })
        .toUpperCase();
}
