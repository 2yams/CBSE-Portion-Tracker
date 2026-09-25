import React from 'react';
import { CheckCircle2, Clock, RotateCcw, BookCheck, Award, FileText } from 'lucide-react';
import { Subject, ChapterProgress } from '../types';
import { getProgressKey } from '../utils/storage';

interface AnalyticsOverviewProps {
  subject: Subject;
  gradeId: string;
  progress: Record<string, ChapterProgress>;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  subject,
  gradeId,
  progress,
}) => {
  const chapters = subject.chapters;
  const total = chapters.length;

  let completedCount = 0;
  let inProgressCount = 0;
  let revisedCount = 0;
  let ncertDone = 0;
  let pyqDone = 0;
  let notesWritten = 0;
  let totalConfidence = 0;
  let ratedCount = 0;

  chapters.forEach((ch) => {
    const key = getProgressKey(gradeId, subject.id, ch.id);
    const p = progress[key];
    if (p) {
      if (p.status === 'completed' || p.status === 'revised') completedCount++;
      if (p.status === 'in_progress') inProgressCount++;
      if (p.status === 'revised' || p.revisionsCount > 0) revisedCount++;
      if (p.checklist.ncertTheory) ncertDone++;
      if (p.checklist.previousYearQuestions) pyqDone++;
      if (p.notes && p.notes.trim().length > 0) notesWritten++;
      if (p.confidence) {
        totalConfidence += p.confidence;
        ratedCount++;
      }
    }
  });

  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const avgConfidence = ratedCount > 0 ? (totalConfidence / ratedCount).toFixed(1) : '—';

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 sm:p-5 shadow-2xs">
      
      {/* Top row: Subject Title, quick status & progress bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              {subject.name}
            </h2>
            {subject.code && (
              <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                Code {subject.code}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {completedCount} of {total} chapters covered ({percentage}%) • {total - completedCount} remaining
          </p>
        </div>

        {/* Minimal Progress Bar */}
        <div className="flex items-center gap-3 min-w-[200px] sm:w-64">
          <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 dark:bg-neutral-100 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 pt-4">
        
        {/* Completed */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Completed
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {completedCount} <span className="text-xs font-normal text-neutral-400">/ {total}</span>
          </span>
        </div>

        {/* In Progress */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            In Progress
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {inProgressCount}
          </span>
        </div>

        {/* Revisions Done */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-amber-500" />
            Revisions
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {revisedCount} <span className="text-xs font-normal text-neutral-400">ch.</span>
          </span>
        </div>

        {/* NCERT Theory Read */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <BookCheck className="w-3 h-3 text-indigo-500" />
            NCERT Read
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {ncertDone} <span className="text-xs font-normal text-neutral-400">/ {total}</span>
          </span>
        </div>

        {/* PYQs Solved */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <Award className="w-3 h-3 text-purple-500" />
            PYQs Solved
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {pyqDone} <span className="text-xs font-normal text-neutral-400">/ {total}</span>
          </span>
        </div>

        {/* Study Notes Added */}
        <div className="flex flex-col">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <FileText className="w-3 h-3 text-teal-500" />
            Chapters with Notes
          </span>
          <span className="text-lg font-semibold font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
            {notesWritten} <span className="text-xs font-normal text-neutral-400">/ {total}</span>
          </span>
        </div>

      </div>

    </div>
  );
};
