import { JobCategory } from '@/lib/types';
import { SECTION_TITLES } from '@/lib/constants';
import { Section } from './Section';
import { AutoScroller } from './AutoScroller';

interface ColumnProps {
    title: string;
    category: JobCategory;
    theme?: 'slate' | 'blue' | 'amber';
}

/**
 * Renders a full production-line column with the three
 * time-bucket sections (OVERDUE / TODAY / TOMORROW).
 * The content area auto-scrolls slowly downward and snaps back to top.
 */
export function Column({ title, category, theme = 'slate' }: ColumnProps) {
    const isBlue = theme === 'blue';
    const isAmber = theme === 'amber';

    return (
        <div className={`flex-1 flex flex-col min-w-0 relative border-r last:border-r-0 ${isBlue ? 'bg-indigo-950/20 border-indigo-900/40' : (isAmber ? 'bg-amber-950/20 border-amber-900/40' : 'bg-slate-900/40 border-slate-800')
            }`}>
            {/* Column Header */}
            <div className={`px-4 sm:px-8 py-4 sm:py-5 border-b-2 flex items-center justify-center shadow-lg shrink-0 ${isBlue ? 'bg-indigo-950/80 border-indigo-800 shadow-[0_4px_12px_rgba(30,27,75,0.8)]' : (isAmber ? 'bg-amber-950/80 border-amber-800 shadow-[0_4px_12px_rgba(69,26,3,0.8)]' : 'bg-slate-950/80 border-slate-800 shadow-[0_4px_12px_rgba(2,6,23,0.8)]')
                }`}>
                <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-widest uppercase text-center ${isBlue ? 'text-indigo-50' : (isAmber ? 'text-amber-50' : 'text-white')
                    }`}>
                    {title}
                </h2>
            </div>

            {/* Auto-scrolling Content */}
            <AutoScroller speed={25} pauseAtBottom={2000} pauseAtTop={1000}>
                <Section title={SECTION_TITLES.OVERDUE} jobs={category.overdue} urgent={true} theme={theme} />
                <Section title={SECTION_TITLES.TODAY} jobs={category.today} theme={theme} />
                <Section title={SECTION_TITLES.TOMORROW} jobs={category.tomorrow} theme={theme} />
            </AutoScroller>
        </div>
    );
}
