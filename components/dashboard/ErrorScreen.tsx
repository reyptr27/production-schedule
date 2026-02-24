import { ClockAlert } from 'lucide-react';

interface ErrorScreenProps {
    message: string | null;
}

/**
 * Full-screen error state displayed when the data fetch fails entirely.
 * Never exposes raw error messages from the DB to the user.
 */
export function ErrorScreen({ message }: ErrorScreenProps) {
    return (
        <main
            className="flex-1 flex items-center justify-center bg-slate-900"
            role="alert"
            aria-live="assertive"
        >
            <div className="text-center px-6 py-12">
                <ClockAlert className="w-16 h-16 sm:w-24 sm:h-24 text-red-900/60 mx-auto mb-6" aria-hidden="true" />
                <h2 className="text-2xl sm:text-4xl font-black text-slate-700 uppercase tracking-widest">
                    SYSTEM OFFLINE
                </h2>
                {message && (
                    <p className="text-slate-600 mt-3 font-mono tracking-wider text-sm sm:text-base max-w-md mx-auto">
                        {message}
                    </p>
                )}
                <p className="text-slate-700 mt-6 text-xs tracking-widest uppercase">
                    The page will automatically retry in 5 minutes.
                </p>
            </div>
        </main>
    );
}
