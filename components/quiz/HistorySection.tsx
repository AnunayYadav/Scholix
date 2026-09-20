import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { slugify } from '../../utils/slugify';
import { useQuizDashboardStore } from '../../stores/quizStore';

const HistorySection: React.FC = () => {
  const navigate = useNavigate();
  const { setDashboardView } = useQuizDashboardStore();
  const [searchQuery, setSearchQuery] = useState('');

  const recent = JSON.parse(localStorage.getItem('nexus_recent_quizzes') || '[]');

  const filteredHistory = recent.filter((q: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (q.name && q.name.toLowerCase().includes(query)) ||
      (q.subject && q.subject.toLowerCase().includes(query))
    );
  });

  const getTotalQuestions = (q: any) => {
    if (q.totalQuestions) return q.totalQuestions;
    try {
      const raw = localStorage.getItem(`nexus_quiz_${q.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.questions?.length) return parsed.questions.length;
      }
    } catch {}
    return 10;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {recent.length === 0 ? (
        <div className="p-10 sm:p-14 rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.05] text-center space-y-3 shadow-xs">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No past assessments yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Completed and in-progress quizzes will appear here.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setDashboardView('dashboard')}
              className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              Start an Assessment
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Row: Filter & Count */}
          <div className="flex items-center justify-between gap-3 px-0.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {recent.length} past {recent.length === 1 ? 'assessment' : 'assessments'}
            </span>

            {recent.length > 3 && (
              <div className="relative flex items-center w-52 sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-100 dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.06] rounded-full text-xs text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Unified Compact Apple Box with Separator List Style */}
          <div className="rounded-2xl bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-white/[0.05] shadow-xs overflow-hidden divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((q: any, idx: number) => {
                const isCompleted = q.score !== null && q.score !== undefined;
                const total = getTotalQuestions(q);
                const quizDate = new Date(q.date);
                const formattedDate = quizDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const formattedTime = quizDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={q.id || idx}
                    onClick={() => navigate(`/quiz/${slugify(q.subject)}/${q.id}`)}
                    className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4 hover:bg-zinc-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    {/* Left: Test Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-orange-500 transition-colors truncate">
                          {q.name || q.subject}
                        </h4>
                        {q.isFeatured && (
                          <span className="text-[9px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-white/[0.06] text-zinc-500 dark:text-zinc-400">
                            featured
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {formattedDate} at {formattedTime}
                        {total ? ` • ${total} questions` : ''}
                      </p>
                    </div>

                    {/* Right: Score/Status & Apple Pill Action Button */}
                    <div className="flex items-center gap-3.5 sm:gap-4 flex-shrink-0">
                      <div className="text-right">
                        {isCompleted ? (
                          <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                            {q.score} / {total}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            In Progress
                          </span>
                        )}
                      </div>

                      {isCompleted ? (
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] dark:text-white text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs text-zinc-400">
                No assessments matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySection;
