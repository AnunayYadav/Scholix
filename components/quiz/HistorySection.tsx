import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  History, 
  Search,
  BookOpen
} from 'lucide-react';
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

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {recent.length === 0 ? (
        <div className="bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 p-10 rounded-2xl text-center space-y-3">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-[#202025] border border-zinc-200/70 dark:border-zinc-700/60 rounded-xl flex items-center justify-center mx-auto text-zinc-400">
            <History className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">No quiz history</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Completed and in-progress assessments will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDashboardView('dashboard')}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-medium hover:bg-brand-primary/90 transition-all cursor-pointer"
          >
            Launch Quiz Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Row: Count & Search */}
          <div className="flex items-center justify-between gap-3 px-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {recent.length} past {recent.length === 1 ? 'assessment' : 'assessments'}
            </span>

            {recent.length > 3 && (
              <div className="relative flex items-center w-56">
                <Search className="w-3.5 h-3.5 absolute left-2.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand-primary/50"
                />
              </div>
            )}
          </div>

          {/* High-density real app list container */}
          <div className="bg-white dark:bg-[#17171a] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((q: any, idx: number) => {
                const isCompleted = q.score !== null && q.score !== undefined;
                const quizDate = new Date(q.date);
                const formattedDate = quizDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const formattedTime = quizDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div
                    key={q.id || idx}
                    onClick={() => navigate(`/quiz/${slugify(q.subject)}/${q.id}`)}
                    className="p-3.5 sm:px-5 sm:py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-[#1f1f24] transition-colors cursor-pointer group"
                  >
                    {/* Left: Status Icon & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors truncate">
                            {q.name || q.subject}
                          </h4>
                          {q.subject && q.name && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-[#202025] text-zinc-500 dark:text-zinc-400 hidden sm:inline-block flex-shrink-0">
                              {q.subject}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <span>{formattedDate} at {formattedTime}</span>
                          {q.totalQuestions && (
                            <>
                              <span>•</span>
                              <span>{q.totalQuestions} questions</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Score badge & Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isCompleted ? `${q.score} pts` : 'In Progress'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium text-zinc-400 group-hover:text-brand-primary transition-colors">
                        <span className="hidden md:inline">Review</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400">
                No assessments found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorySection;
