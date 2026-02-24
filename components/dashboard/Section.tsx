import { JobItem } from '@/lib/types';
import { ClockAlert, CheckCircle2, Weight, ClipboardList } from 'lucide-react';
import { JobCard } from './JobCard';
import { GRAMS_PER_KG } from '@/lib/constants';

interface SectionProps {
    title: string;
    jobs: JobItem[];
    urgent?: boolean;
    theme?: 'slate' | 'blue' | 'amber';
}

export function Section({ title, jobs, urgent = false, theme = 'slate' }: SectionProps) {
    const isBlue = theme === 'blue';
    const isAmber = theme === 'amber';


    // Sum all non-null quantities (stored in grams → convert to KG)
    const totalGrams = jobs.reduce((sum, j) => sum + (j.quantity ?? 0), 0);
    const totalKg = (totalGrams / GRAMS_PER_KG).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    const hasQty = totalGrams > 0;

    return (
        <section className="mb-8 w-full" aria-label={`${title} jobs`}>
            {/* Section Header — sticky within the scrollable column */}
            <div className={`sticky top-0 z-10 relative flex items-center justify-between gap-3 border-b-4 pt-3 pb-2 mb-4 -mx-4 px-4
                after:absolute after:bottom-full after:left-0 after:right-0 after:h-10 after:content-['']
                ${urgent
                    ? `border-red-600 ${isBlue ? 'bg-indigo-950 after:bg-indigo-950' : (isAmber ? 'bg-amber-950 after:bg-amber-950' : 'bg-slate-950 after:bg-slate-950')}`
                    : (isBlue ? 'border-indigo-700 bg-indigo-950 after:bg-indigo-950' : (isAmber ? 'border-amber-700 bg-amber-950 after:bg-amber-950' : 'border-slate-600 bg-slate-950 after:bg-slate-950'))
                }`}>

                {/* Left: icon + title */}
                <div className="flex items-center gap-3 min-w-0">
                    {urgent
                        ? <ClockAlert className="w-7 h-7 text-red-500 shrink-0" aria-hidden="true" />
                        : <CheckCircle2 className={`w-7 h-7 shrink-0 ${isBlue ? 'text-indigo-400' : (isAmber ? 'text-amber-500' : 'text-slate-500')}`} aria-hidden="true" />
                    }
                    <h3 className={`text-2xl font-black tracking-widest uppercase ${urgent ? 'text-red-500' : (isBlue ? 'text-indigo-300' : (isAmber ? 'text-amber-300' : 'text-slate-400'))}`}>
                        {title}
                    </h3>
                </div>

                {/* Right: PRODO count + KG badges */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* PRODO count badge */}
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-2xl tracking-widest shadow-md ${urgent
                        ? 'bg-red-900/60 text-red-200 border border-red-700'
                        : (isBlue ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-700/60' : (isAmber ? 'bg-amber-900/50 text-amber-200 border border-amber-700/60' : 'bg-slate-800 text-slate-200 border border-slate-600'))
                        }`}>
                        <ClipboardList className="w-6 h-6 shrink-0" aria-hidden="true" />
                        <span>PRODO {jobs.length}</span>
                    </div>

                    {/* Total KG badge */}
                    {hasQty && (
                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-2xl tracking-widest shadow-md ${urgent
                            ? 'bg-red-900/60 text-red-200 border border-red-700'
                            : (isBlue ? 'bg-indigo-900/50 text-cyan-300 border border-indigo-700/60' : (isAmber ? 'bg-amber-900/50 text-yellow-400 border border-amber-700/60' : 'bg-slate-800 text-emerald-300 border border-slate-600'))
                            }`}>
                            <Weight className="w-6 h-6 shrink-0" aria-hidden="true" />
                            <span>{totalKg} KG</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Job List */}
            <div role="list" className="flex flex-col">
                {jobs.length === 0 ? (
                    <div role="listitem" className={`rounded-xl border p-5 flex justify-center ${isBlue ? 'bg-indigo-900/20 border-indigo-800/50' : (isAmber ? 'bg-amber-900/20 border-amber-800/50' : 'bg-slate-900/50 border-slate-800')
                        }`}>
                        <span className={`text-base font-semibold tracking-wider italic uppercase ${isBlue ? 'text-indigo-400' : (isAmber ? 'text-amber-500' : 'text-slate-500')
                            }`}>
                            {urgent
                                ? 'No Overdue Jobs ✓'
                                : `No ${title} Jobs ✓`
                            }
                        </span>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.no} role="listitem">
                            <JobCard job={job} urgent={urgent} theme={theme} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
