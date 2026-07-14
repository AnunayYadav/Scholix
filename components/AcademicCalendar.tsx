import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface CalendarEvent {
  day: string;
  monthYear: string;
  weekday: string;
  title: string;
  category: 'Academic' | 'Exam' | 'OPPE';
  description: string;
  isImportant?: boolean;
}

const events: CalendarEvent[] = [
  {
    day: "12",
    monthYear: "Jun 2026",
    weekday: "Friday",
    title: "Term Start & Week 1 Content Release",
    category: "Academic",
    description: "Official start of the May 2026 Term. Week 1 content is released on the portal.",
    isImportant: true
  },
  {
    day: "1",
    monthYear: "Jul 2026",
    weekday: "Wednesday",
    title: "OPPE Slot Allocation (Tentative)",
    category: "Academic",
    description: "Tentative — early July. Exam slots are released to individual students. Complete the OPPE System Compatibility Test (SCT) to stay eligible.",
    isImportant: false
  },
  {
    day: "19",
    monthYear: "Jul 2026",
    weekday: "Sunday",
    title: "Quiz 1 / Qualifier",
    category: "Exam",
    description: "In-person quiz at designated exam centres. Time: 2:00 PM – 6:00 PM.",
    isImportant: true
  },
  {
    day: "1",
    monthYear: "Aug 2026",
    weekday: "Saturday",
    title: "OPPE 1 — Day 1",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Courses: Foundation Python, Diploma MLP, Degree C Programming.",
    isImportant: true
  },
  {
    day: "2",
    monthYear: "Aug 2026",
    weekday: "Sunday",
    title: "OPPE 1 — Day 2",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Courses: Foundation Python, Diploma Java/TDS, Degree MLOPS.",
    isImportant: true
  },
  {
    day: "16",
    monthYear: "Aug 2026",
    weekday: "Sunday",
    title: "Quiz 2 / 2nd Qualifier / Re-attempt",
    category: "Exam",
    description: "In-person quiz at designated exam centres. Time: 2:00 PM – 6:00 PM.",
    isImportant: true
  },
  {
    day: "29",
    monthYear: "Aug 2026",
    weekday: "Saturday",
    title: "OPPE 2 — Day 1",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Courses: Diploma System Commands/DBMS, Degree C Programming.",
    isImportant: false
  },
  {
    day: "30",
    monthYear: "Aug 2026",
    weekday: "Sunday",
    title: "OPPE 2 — Day 2",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Multiple Diploma & Degree courses.",
    isImportant: true
  },
  {
    day: "5",
    monthYear: "Sep 2026",
    weekday: "Saturday",
    title: "OPPE 2 — Day 3",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Courses: Diploma System Commands, Foundation Python.",
    isImportant: false
  },
  {
    day: "6",
    monthYear: "Sep 2026",
    weekday: "Sunday",
    title: "OPPE 2 — Day 4",
    category: "OPPE",
    description: "Online Proctored Programming Exam. Multiple courses including MLOPS.",
    isImportant: true
  },
  {
    day: "13",
    monthYear: "Sep 2026",
    weekday: "Sunday",
    title: "End Term Exam / 2nd Re-attempt",
    category: "Exam",
    description: "Final End Term Exam for all levels. In-person at centres. Sessions: 9 AM – 12 PM & 2 PM – 5 PM.",
    isImportant: true
  }
];

export const AcademicCalendar: React.FC = () => {
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Exam':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'OPPE':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-zinc-100/80 dark:border-white/5 p-5 lg:p-6 shadow-sm overflow-hidden flex flex-col h-[480px]">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <Calendar size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
              Academic <span className="text-brand-primary">Calendar</span>
            </h4>
            <p className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase mt-0.5">May 2026 Term</p>
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 no-scrollbar">
          {events.map((event, idx) => (
            <div 
              key={idx} 
              className="flex gap-4 items-start border-b border-zinc-100 dark:border-white/5 pb-3 last:border-none last:pb-0"
            >
              {/* Date Box */}
              <div className="w-12 flex-shrink-0 text-center flex flex-col items-center bg-zinc-50 dark:bg-white/[0.02] py-2 rounded-xl border border-zinc-200/20 dark:border-white/5">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-none">
                  {event.day}
                </span>
                <span className="text-[8px] text-zinc-400 font-semibold uppercase mt-1">
                  {event.monthYear.split(' ')[0]}
                </span>
              </div>

              {/* Event Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCategoryStyles(event.category)}`}>
                    {event.category}
                  </span>
                  {event.isImportant && (
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-amber-500">
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      Important
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-semibold text-zinc-900 dark:text-white leading-snug">
                  {event.title}
                </h5>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AcademicCalendar;
