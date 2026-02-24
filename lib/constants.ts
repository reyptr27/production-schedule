/**
 * Application-wide constants.
 * Keep all magic numbers and strings here — never scatter them across components.
 */

/** Timezone used across the entire app for date comparisons. */
export const APP_TIMEZONE = 'Asia/Jakarta' as const;

/** How often (seconds) the API route revalidates the DB query. */
export const API_REVALIDATE_SECONDS = 300;

/** How often (seconds) the browser page auto-refreshes via meta tag. */
export const PAGE_REFRESH_SECONDS = 300;

/** How many grams are in one kilogram — used for unit conversion. */
export const GRAMS_PER_KG = 1000;

/** SQL Server view names for each production line. */
export const DB_VIEWS = {
    RELABEL_FILLING: 'vw_ProdSchedule_ReleasedProd_RF',
    MIXING: 'vw_ProdSchedule_ReleasedProd_M',
} as const;

/** Status values that should be excluded from the dashboard. */
export const EXCLUDED_STATUSES = ['Completed'] as const;

/** Column header labels for the two production lines. */
export const COLUMN_LABELS = {
    RELABEL_FILLING: 'RELABEL & FILLING',
    MIXING: 'MIXING',
} as const;

/** Section titles for the job groupings. */
export const SECTION_TITLES = {
    OVERDUE: 'OVERDUE',
    TODAY: 'TODAY',
    TOMORROW: 'TOMORROW',
} as const;
