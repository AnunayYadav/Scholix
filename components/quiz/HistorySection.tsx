import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuizDashboardStore } from '../../stores/quizStore';

const HistorySection: React.FC = () => {
  const navigate = useNavigate();
  const { setDashboardView } = useQuizDashboardStore();

  const recent = JSON.parse(localStorage.getItem('nexus_recent_quizzes') || '[]');

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {recent.length === 0 ? (
        <div className="glass-panel p-12 rounded-[48px] text-center space-y-4 border-dashed">
          <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No history yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">Start your first quiz to see your performance history and progress trackers here.</p>
          </div>
          <button
            onClick={() => setDashboardView('dashboard')}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-2xl text-xs font-semibold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
          >
            Launch Quiz Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recent.map((q: any, idx: number) => (
            <motion.button
              key={q.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/quiz/${encodeURIComponent(q.subject)}/${q.id}`)}
              className="glass-panel p-6 rounded-[40px] text-left hover:border-orange-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-orange-600/10 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 tracking-wider">{new Date(q.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                    <p className="text-[10px] font-medium text-slate-500 opacity-60">{new Date(q.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-orange-500 transition-colors">{q.subject}</h3>
              
              <div className="h-px bg-slate-100 dark:bg-white/5 w-full mb-4" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 tracking-wider mb-0.5">Performance</p>
                  <p className={`text-sm font-semibold ${q.score !== null ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {q.score !== null ? `${q.score} Points` : 'In Progress'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-600">
                  <span className="text-[10px] font-semibold tracking-wider">Review</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorySection;
