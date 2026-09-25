import React from 'react';
import { Plus, BookMarked, Sparkles } from 'lucide-react';
import { Subject, ChapterProgress } from '../types';
import { calculateSubjectProgress } from '../utils/storage';

interface SubjectBarProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  gradeId: string;
  progress: Record<string, ChapterProgress>;
  onOpenAddModal: () => void;
}

export const SubjectBar: React.FC<SubjectBarProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  gradeId,
  progress,
  onOpenAddModal,
}) => {
  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2.5 gap-2">
          
          <div className="flex items-center gap-1.5 min-w-max">
            {subjects.map((subject) => {
              const isActive = subject.id === selectedSubjectId;
              const { completed, total, percentage, revised } = calculateSubjectProgress(
                subject.chapters,
                gradeId,
                subject.id,
                progress
              );

              return (
                <button
                  key={subject.id}
                  onClick={() => onSelectSubject(subject.id)}
                  className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  }`}
                >
                  <span>{subject.name}</span>
                  {subject.code && (
                    <span className={`text-[10px] font-mono opacity-60 ${isActive ? 'text-neutral-300 dark:text-neutral-600' : ''}`}>
                      ({subject.code})
                    </span>
                  )}
                  
                  {/* Subject progress indicator */}
                  <span
                    className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive
                        ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                        : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {percentage}%
                  </span>

                  {revised > 0 && (
                    <span
                      title={`${revised} chapter(s) revised`}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? 'bg-amber-300 dark:bg-amber-600' : 'bg-amber-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pl-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Topic / Subject</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
