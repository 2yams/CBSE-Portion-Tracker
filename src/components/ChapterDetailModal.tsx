import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Calendar,
  RotateCcw,
  Star,
  CheckSquare,
  Square,
  Sparkle,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Save
} from 'lucide-react';
import { Chapter, ChapterProgress, CompletionStatus, ChecklistStep } from '../types';
import { DEFAULT_CHECKLIST } from '../data/defaultCurriculum';

interface ChapterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  gradeName: string;
  subjectName: string;
  progress?: ChapterProgress;
  onSaveProgress: (updated: Partial<ChapterProgress>) => void;
}

export const ChapterDetailModal: React.FC<ChapterDetailModalProps> = ({
  isOpen,
  onClose,
  chapter,
  gradeName,
  subjectName,
  progress,
  onSaveProgress,
}) => {
  if (!isOpen || !chapter) return null;

  const [status, setStatus] = useState<CompletionStatus>(progress?.status || 'not_started');
  const [checklist, setChecklist] = useState<ChecklistStep>(progress?.checklist ? { ...progress.checklist } : { ...DEFAULT_CHECKLIST });
  const [notes, setNotes] = useState<string>(progress?.notes || '');
  const [confidence, setConfidence] = useState<number>(progress?.confidence || 1);
  const [difficulty, setDifficulty] = useState<number>(progress?.difficulty || 3);
  const [revisionsCount, setRevisionsCount] = useState<number>(progress?.revisionsCount || 0);
  const [completedDate, setCompletedDate] = useState<string>(progress?.completedDate || '');
  const [targetDate, setTargetDate] = useState<string>(progress?.targetDate || '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state if chapter changes
  useEffect(() => {
    if (chapter) {
      setStatus(progress?.status || 'not_started');
      setChecklist(progress?.checklist ? { ...progress.checklist } : { ...DEFAULT_CHECKLIST });
      setNotes(progress?.notes || '');
      setConfidence(progress?.confidence || 1);
      setDifficulty(progress?.difficulty || 3);
      setRevisionsCount(progress?.revisionsCount || 0);
      setCompletedDate(progress?.completedDate || '');
      setTargetDate(progress?.targetDate || '');
    }
  }, [chapter, progress]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const triggerSave = (partialUpdates: Partial<ChapterProgress>) => {
    onSaveProgress(partialUpdates);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 1500);
  };

  const handleStatusChange = (newStatus: CompletionStatus) => {
    setStatus(newStatus);
    const updates: Partial<ChapterProgress> = { status: newStatus };
    if ((newStatus === 'completed' || newStatus === 'revised') && !completedDate) {
      const today = new Date().toISOString().split('T')[0];
      setCompletedDate(today);
      updates.completedDate = today;
    }
    triggerSave(updates);
  };

  const toggleChecklist = (key: keyof ChecklistStep) => {
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);

    // Auto update status to in_progress or completed if all checked
    const allChecked = Object.values(updated).every(Boolean);
    const updates: Partial<ChapterProgress> = { checklist: updated };

    if (allChecked && status !== 'completed' && status !== 'revised') {
      setStatus('completed');
      updates.status = 'completed';
      if (!completedDate) {
        const today = new Date().toISOString().split('T')[0];
        setCompletedDate(today);
        updates.completedDate = today;
      }
    } else if (Object.values(updated).some(Boolean) && status === 'not_started') {
      setStatus('in_progress');
      updates.status = 'in_progress';
    }

    triggerSave(updates);
  };

  const handleSelectAllChecklist = (selectAll: boolean) => {
    const updated: ChecklistStep = {
      ncertTheory: selectAll,
      inTextQuestions: selectAll,
      backExercises: selectAll,
      exemplarProblems: selectAll,
      previousYearQuestions: selectAll,
      formulaOrSummaryNotes: selectAll,
      mockTestOrSamplePaper: selectAll,
    };
    setChecklist(updated);
    const updates: Partial<ChapterProgress> = { checklist: updated };
    if (selectAll) {
      setStatus('completed');
      updates.status = 'completed';
      if (!completedDate) {
        const today = new Date().toISOString().split('T')[0];
        setCompletedDate(today);
        updates.completedDate = today;
      }
    }
    triggerSave(updates);
  };

  const handleNotesChange = (val: string) => {
    setNotes(val);
    triggerSave({ notes: val });
  };

  const appendNoteTemplate = (template: string) => {
    const newNotes = notes ? `${notes}\n\n${template}` : template;
    setNotes(newNotes);
    triggerSave({ notes: newNotes });
  };

  const handleConfidenceChange = (rating: number) => {
    setConfidence(rating);
    triggerSave({ confidence: rating });
  };

  const handleDifficultyChange = (diff: number) => {
    setDifficulty(diff);
    triggerSave({ difficulty: diff });
  };

  const handleRevisionIncrement = () => {
    const newCount = revisionsCount + 1;
    const today = new Date().toISOString().split('T')[0];
    setRevisionsCount(newCount);
    setStatus('revised');
    triggerSave({
      revisionsCount: newCount,
      lastRevisedDate: today,
      status: 'revised',
    });
  };

  const confidenceLabels: Record<number, string> = {
    1: 'Need Practice (Uncertain)',
    2: 'Basic Concepts Known',
    3: 'Moderate / Standard Questions Done',
    4: 'Strong / Confident on PYQs',
    5: 'Mastered / Board Exam Ready',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{gradeName}</span>
              <span>•</span>
              <span>{subjectName}</span>
              {chapter.unitName && (
                <>
                  <span>•</span>
                  <span className="uppercase">{chapter.unitName}</span>
                </>
              )}
            </div>
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
              {chapter.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {savedFeedback && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Synced
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Completion Status Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Current Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('not_started')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  status === 'not_started'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 border-transparent shadow-xs'
                    : 'bg-white dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                <span>Not Started</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('in_progress')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  status === 'in_progress'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('completed')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  status === 'completed'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('revised')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  status === 'revised'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700/80 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Revised ({revisionsCount})</span>
              </button>
            </div>
          </div>

          {/* Section 2: Dates & Revisions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Completed Date
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => {
                  setCompletedDate(e.target.value);
                  triggerSave({ completedDate: e.target.value });
                }}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Target / Deadline
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  triggerSave({ targetDate: e.target.value });
                }}
                className="w-full text-xs px-2.5 py-1.5 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Revision Tracker
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRevisionIncrement}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-purple-500" />
                  <span>+1 Revision</span>
                </button>
                <span className="text-xs font-mono px-2 py-1.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold">
                  {revisionsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: CBSE Milestone Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                CBSE Study Milestones
              </label>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => handleSelectAllChecklist(true)}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 underline cursor-pointer"
                >
                  Select all
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllChecklist(false)}
                  className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { key: 'ncertTheory' as const, title: 'NCERT Textbook Theory', desc: 'Read line-by-line, highlighted definitions, cleared conceptual doubts' },
                { key: 'inTextQuestions' as const, title: 'In-Text & Example Questions', desc: 'Solved all worked examples and in-text checkpoint exercises' },
                { key: 'backExercises' as const, title: 'Back of Chapter Exercises', desc: 'Written step-by-step solutions for all terminal NCERT exercises' },
                { key: 'exemplarProblems' as const, title: 'NCERT Exemplar / HOTS', desc: 'Attempted Higher Order Thinking Skills and Exemplar MCQs/numericals' },
                { key: 'previousYearQuestions' as const, title: 'CBSE Board PYQs (5-10 Years)', desc: 'Practiced authentic past board question papers and marking scheme patterns' },
                { key: 'formulaOrSummaryNotes' as const, title: 'Formula Sheet / Summary Notes', desc: 'Synthesized one-page formula sheet, mindmap, or memory triggers' },
                { key: 'mockTestOrSamplePaper' as const, title: 'Mock Test / Sample Paper', desc: 'Attempted timed chapter quiz or official CBSE sample paper questions' },
              ].map((item) => {
                const isChecked = checklist[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleChecklist(item.key)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                        : 'bg-white dark:bg-neutral-800/40 border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: "How I Completed This Chapter" - Personal Notes Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                How I Completed This Chapter (Personal Notes)
              </label>
              <span className="text-[10px] font-mono text-neutral-400">Auto-saved</span>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              Record your methodology, reference channels, formulas memorized, tricky board questions, or study reflections.
            </p>

            {/* Quick Template Prompts */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => appendNoteTemplate('• Important Formulas:\n- \n- ')}
                className="text-[11px] font-medium px-2 py-0.8 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                + Formulas
              </button>
              <button
                type="button"
                onClick={() => appendNoteTemplate('• Tricky Topics & Common Mistakes:\n- \n- ')}
                className="text-[11px] font-medium px-2 py-0.8 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                + Mistakes to Avoid
              </button>
              <button
                type="button"
                onClick={() => appendNoteTemplate('• Resources Used:\n- Book / Reference: \n- Lecture / Channel: ')}
                className="text-[11px] font-medium px-2 py-0.8 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                + Resources & Books
              </button>
              <button
                type="button"
                onClick={() => appendNoteTemplate('• Board Exam Strategy:\n- Expected weightage: \n- High-yield questions: ')}
                className="text-[11px] font-medium px-2 py-0.8 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                + Exam Strategy
              </button>
            </div>

            <textarea
              rows={6}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g. Mastered the derivation for Lens Maker's formula. Solved all NCERT back exercises. Watched Mohit Tyagi / Khan Academy for difficult cases. Remember: in 5-mark PYQs, always write units explicitly!"
              className="w-full text-xs font-mono leading-relaxed p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-y"
            />
          </div>

          {/* Section 5: Confidence & Difficulty Ratings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            {/* Confidence */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Confidence Level ({confidence}/5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleConfidenceChange(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                    title={`Rate ${star} out of 5`}
                  >
                    <Star
                      className={`w-5 h-5 ${star <= confidence ? 'fill-current text-amber-500' : 'text-neutral-300 dark:text-neutral-700'}`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                {confidenceLabels[confidence]}
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                Perceived Difficulty ({difficulty}/5)
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleDifficultyChange(lvl)}
                    className={`w-7 h-7 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                {difficulty === 1 && 'Very Easy / Quick'}
                {difficulty === 2 && 'Easy / Standard'}
                {difficulty === 3 && 'Moderate Length'}
                {difficulty === 4 && 'Challenging Concepts'}
                {difficulty === 5 && 'Hard / High Practice Required'}
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <Save className="w-3.5 h-3.5" />
            <span>Saved to local device offline</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white/90 transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};
