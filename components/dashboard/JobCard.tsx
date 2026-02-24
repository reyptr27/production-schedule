import { JobItem } from '@/lib/types';
import { formatDate, gramsToKg } from '@/lib/formatters';

interface JobCardProps {
    job: JobItem;
    urgent?: boolean;
    theme?: 'slate' | 'blue' | 'amber';
}

export function JobCard({ job, urgent = false, theme = 'slate' }: JobCardProps) {
    const isBlue = theme === 'blue';
    const isAmber = theme === 'amber';

    const base = urgent
        ? 'bg-red-950/60 border-red-500 text-red-50'
        : (isBlue ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-50' : (isAmber ? 'bg-amber-950/40 border-amber-600/50 text-amber-50' : 'bg-slate-800/80 border-slate-500 text-slate-100'));
    const mutedColor = urgent ? 'text-red-300/70' : (isBlue ? 'text-indigo-300/70' : (isAmber ? 'text-amber-400/60' : 'text-slate-400'));
    const valueColor = urgent ? 'text-red-50' : (isBlue ? 'text-indigo-50' : (isAmber ? 'text-orange-50' : 'text-white'));
    const badgeBg = urgent ? 'bg-red-700/50' : (isBlue ? 'bg-indigo-800/60 text-indigo-100' : (isAmber ? 'bg-amber-800/60 text-amber-100' : 'bg-slate-700/70'));
    const borderColor = urgent ? 'border-red-800' : (isBlue ? 'border-indigo-800/60' : (isAmber ? 'border-amber-800/60' : 'border-slate-600'));
    const remarkBg = urgent ? 'border-red-700 bg-red-900/40' : (isBlue ? 'border-indigo-800/60 bg-indigo-900/20' : (isAmber ? 'border-amber-800/60 bg-amber-900/20' : 'border-slate-600 bg-slate-800/60'));
    const qtyColor = urgent ? 'text-red-200' : (isBlue ? 'text-cyan-300' : (isAmber ? 'text-yellow-400' : 'text-emerald-300'));

    const kgDisplay = gramsToKg(job.quantity);

    return (
        <article
            className={`relative px-6 py-6 mb-5 shadow-xl border-l-[8px] rounded-r-2xl ${base}`}
            aria-label={`Production order ${job.no}`}
        >


            {/* ── Top-Right: Location + Overdue ── */}
            <div className="absolute top-5 right-5 flex flex-row items-center gap-3">
                {urgent && (job.overdueDays ?? 0) > 0 && (
                    <span className="bg-red-600 text-white text-2xl px-5 py-2 rounded-xl font-black tracking-widest animate-pulse">
                        {job.overdueDays} DAYS OVERDUE
                    </span>
                )}
                <div className={`text-2xl px-5 py-2 font-black rounded-xl uppercase tracking-widest shadow-lg ${badgeBg}`}>
                    {job.locationCode}
                </div>
            </div>

            {/* ── Header: Order No ── */}
            <div className="mb-2 pr-32">
                <h4 className="text-3xl font-black tracking-widest leading-tight truncate">
                    {job.no}
                </h4>
            </div>

            {/* ── Item Description ── */}
            <div className={`text-xl font-bold uppercase tracking-wide mb-5 truncate ${valueColor}`}>
                {job.itemDescription || '—'}
            </div>

            {/* ── Info Grid 3-col ── */}
            <dl className={`grid grid-cols-3 gap-x-6 gap-y-6 mb-5 border-y ${borderColor} py-6`}>
                <InfoField label="Source No." value={job.sourceNo} muted={mutedColor} val={valueColor} />
                <InfoField label="Routing No." value={job.routingNo} muted={mutedColor} val={valueColor} />
                <InfoField label="Quantity" value={kgDisplay ? `${kgDisplay} KG` : '—'} muted={mutedColor} val={`font-black ${qtyColor}`} />
                <InfoField label="Demand Source ID" value={job.demandSourceID} muted={mutedColor} val={valueColor} />
                <InfoField label="Lead Time" value={job.leadTimeDays != null ? `${job.leadTimeDays} Day` : null} muted={mutedColor} val={valueColor} />
                <InfoField label="Status" value={job.status} muted={mutedColor} val={valueColor} />
            </dl>

            <div className="flex items-center gap-8 flex-wrap">
                <DateBadge prefix="Created" date={job.creationDate} muted={mutedColor} val={valueColor} />
                <DateBadge prefix="Start" date={job.startingDate} muted={mutedColor} val={valueColor} />
                <DateBadge prefix="End" date={job.endingDate} muted={mutedColor} val={valueColor} />
                <DateBadge prefix="Due" date={job.dueDate} muted={mutedColor} val={urgent ? 'text-red-300 font-bold' : 'text-emerald-400 font-bold'} />
            </div>

            {/* ── Remark ── */}
            {job.remark && (
                <div className={`mt-4 text-base italic ${valueColor} px-4 py-3 rounded-xl border ${remarkBg}`}>
                    <span className={`font-bold not-italic mr-1 ${mutedColor}`}>Remark:</span>
                    {job.remark}
                </div>
            )}
        </article>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function InfoField({
    label, value, muted, val,
}: { label: string; value: string | null | undefined; muted: string; val: string }) {
    return (
        <div className="flex flex-col min-w-0">
            <dt className={`text-base uppercase font-bold tracking-widest mb-1.5 ${muted}`}>{label}</dt>
            <dd className={`text-2xl font-bold truncate ${val}`}>{value || '—'}</dd>
        </div>
    );
}

function DateBadge({
    prefix, date, muted, val,
}: { prefix: string; date: string; muted: string; val: string }) {
    return (
        <div className="text-2xl">
            <span className={`font-bold mr-1 ${muted}`}>{prefix}:</span>
            <span className={`font-semibold ${val}`}>{formatDate(date)}</span>
        </div>
    );
}
