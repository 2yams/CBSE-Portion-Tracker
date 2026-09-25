import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  FileText,
  ChevronRight,
  RotateCcw,
  Check,
  Calendar,
  Layers,
  Star
} from 'lucide-react';
import { Chapter, ChapterProgress, CompletionStatus } from '../types';

interface ChapterRowProps {
  index: number;
  chapter: Chapter;
  progress?: ChapterProgress;
  onOpenDetails: (chapter: Chapter) => void;
  onToggleStatus: (chapterId: string, currentStatus: CompletionStatus) => void;
  onIncrementRevision: (chapterId: string) => void;
}

export const ChapterRow: React.FC<ChapterRowProps> = ({
  index,
  chapter,
  progress,
  onOpenDetails,
  onToggleStatus,
  onIncrementRevision,
}) => {
  const status = progress?.status || 'not_started';
  const checklist = progress?.checklist;
  const notes = progress?.notes || '';
  const confidence = progress?.confidence || 1;
  const revisionsCount = progress?.revisionsCount || 0;

  // Calculate completed checklist steps
  const completedStepsCount = checklist
    ? [
        checklist.ncertTheory,
        checklist.inTextQuestions,
        checklist.backExercises,
        checklist.exemplarProblems,
        checklist.previousYearQuestions,
        checklist.formulaOrSummaryNotes,
        checklist.mockTestOrSamplePaper,
      ].filter(Boolean).length
    : 0;

  // Status styling
  const getStatusBadge = () => {
    switch (status) {
      case 'revised':
        return (
          <button
            onClick={() => onToggleStatus(chapter.id, status)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 transition-colors hover:bg-purple-100 dark:hover:bg-purple-900/50 cursor-pointer"
            title="Status: Revised (Click to cycle)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Revised</span>
          </button>
        );
      case 'completed':
        return (
          <button
            onClick={() => onToggleStatus(chapter.id, status)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
            title="Status: Completed (Click to cycle)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Completed</span>
          </button>
        );
      case 'in_progress':
        return (
          <button
            onClick={() => onToggleStatus(chapter.id, status)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer"
            title="Status: In Progress (Click to cycle)"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>In Progress</span>
          </button>
        );
      default:
        return (
          <button
            onClick={() => onToggleStatus(chapter.id, status)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/80 transition-colors hover:bg-neutral-200/70 dark:hover:bg-neutral-700 cursor-pointer"
            title="Status: Not Started (Click to cycle)"
          >
            <Circle className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Not Started</span>
          </button>
        );
    }
  };

  return (
    <div className={`group border border-neutral-200 dark:border-neutral-800/90 rounded-lg bg-white dark:bg-neutral-900 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 ${status === 'completed' || status === 'revised' ? 'bg-neutral-50/50 dark:bg-neutral-900/60' : ''}`}>
      
      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left Side: Chapter index, Title, Unit badge, and weightage */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 pt-0.5 w-6 shrink-0">
            {String(index).padStart(2, '0')}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onOpenDetails(chapter)}
                className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 hover:underline text-left cursor-pointer transition-colors"
              >
                {chapter.name}
              </button>

              {chapter.unitName && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                  {chapter.unitName}
                </span>
              )}

              {chapter.weightageEstimate && (
                <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                  • {chapter.weightageEstimate}
                </span>
              )}
            </div>

            {/* Checklist Micro-indicators & Completion Date */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
              
              {/* Checklist count */}
              <span className="flex items-center gap-1" title={`${completedStepsCount} of 7 milestones cleared`}>
                <span className="inline-block w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700" style={{
                  backgroundColor: completedStepsCount >= 6 ? '#10b981' : completedStepsCount >= 3 ? '#3b82f6' : undefined
                }} />
                <span>{completedStepsCount}/7 steps</span>
              </span>

              {/* Confidence Stars */}
              <span className="flex items-center gap-0.5 text-amber-500 dark:text-amber-400" title={`Confidence: ${confidence} / 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i < confidence ? 'fill-current' : 'opacity-20'}`}
                  />
                ))}
              </span>

              {/* Revisions badge */}
              {revisionsCount > 0 && (
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>{revisionsCount} {revisionsCount === 1 ? 'rev' : 'revs'}</span>
                </span>
              )}

              {/* Date Completed */}
              {progress?.completedDate && (
                <span className="flex items-center gap-1 text-neutral-400 dark:text-neutral-500">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>{progress.completedDate}</span>
                </span>
              )}
            </div>

            {/* Note Snippet / Preview if notes exist */}
            {notes && notes.trim() && (
              <div
                onClick={() => onOpenDetails(chapter)}
                className="mt-2.5 flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-md border border-neutral-200/60 dark:border-neutral-800 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                title="Click to view and edit how you completed this chapter"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <p className="line-clamp-2 italic text-[11px] leading-relaxed">
                  "{notes.trim()}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Status, Quick actions */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
          
          {/* Status Badge */}
          {getStatusBadge()}

          {/* Quick Revision Button */}
          <button
            onClick={() => onIncrementRevision(chapter.id)}
            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Add +1 to revision count"
            aria-label="Add revision"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Detailed Notes & Checklist Drawer Opener */}
          <button
            onClick={() => onOpenDetails(chapter)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shadow-2xs"
            title="Open chapter completion notes and checklist"
          >
            <FileText className="w-3 h-3 text-neutral-500" />
            <span>Notes &amp; Steps</span>
            <ChevronRight className="w-3 h-3 text-neutral-400" />
          </button>

        </div>

      </div>

    </div>
  );
};
