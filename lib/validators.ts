/**
 * Environment variable validation.
 * Validated once at server startup — crashes early with a clear message
 * rather than failing silently deep inside a query.
 */

const REQUIRED_ENV_VARS = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'DB_HOST',
] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

export interface ValidatedEnv {
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PORT: number;
    NEXT_PUBLIC_BASE_URL: string;
}

/**
 * Validates the presence of all required environment variables.
 * Throws a descriptive error listing which vars are missing.
 */
export function validateEnv(): ValidatedEnv {
    const missing: RequiredEnvVar[] = REQUIRED_ENV_VARS.filter(
        (key) => !process.env[key]
    );

    if (missing.length > 0) {
        throw new Error(
            `[Config] Missing required environment variables: ${missing.join(', ')}. ` +
            `Check your .env file.`
        );
    }

    const port = Number(process.env.DB_PORT ?? 1433);
    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(
            `[Config] DB_PORT "${process.env.DB_PORT}" is invalid. Must be a number between 1 and 65535.`
        );
    }

    return {
        DB_USER: process.env.DB_USER!,
        DB_PASSWORD: process.env.DB_PASSWORD!,
        DB_NAME: process.env.DB_NAME!,
        DB_HOST: process.env.DB_HOST!,
        DB_PORT: port,
        NEXT_PUBLIC_BASE_URL:
            process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    };
}
