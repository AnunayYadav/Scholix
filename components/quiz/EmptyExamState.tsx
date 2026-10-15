import React from 'react';
import { BookOpen, FileText } from 'lucide-react';

interface SubjectItem {
  id: string;
  name: string;
}

interface EmptyExamStateProps {
  courseName?: string;
  category?: string;
  year?: string;
  onResetFilters?: () => void;
  onCreateCustomTest?: () => void;
  isNoSubjectSelected?: boolean;
  subjects?: SubjectItem[];
  onSelectSubject?: (subject: any) => void;
}

export const EmptyExamState: React.FC<EmptyExamStateProps> = ({
  courseName,
  category = 'all',
  year = 'all',
  onResetFilters,
  isNoSubjectSelected = false,
}) => {
  const isFiltered = category !== 'all' || year !== 'all';

  if (isNoSubjectSelected) {
    return (
      <div className="py-24 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fade-in">
        {/* Clean, minimal empty state icon */}
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center mb-3 text-zinc-400 dark:text-zinc-500">
          <BookOpen className="w-5 h-5 stroke-[1.5]" />
        </div>

        {/* Clean text */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-1">
          Select a Subject
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
          Choose a course from the dropdown above to view official question papers and practice sets.
        </p>
      </div>
    );
  }

  return (
    <div className="py-24 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-center mb-3 text-zinc-400 dark:text-zinc-500">
        <FileText className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-1">
        No Question Papers Found
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed mb-4">
        {courseName ? (
          <>
            No papers cataloged for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{courseName}</span> under current filters.
          </>
        ) : (
          'No question papers match the selected course or filter criteria.'
        )}
      </p>
      {isFiltered && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] hover:bg-zinc-200 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default EmptyExamState;
