import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Circle,
  BookOpen,
  Plus,
  RotateCcw,
  CheckCheck,
  ChevronDown
} from 'lucide-react';
import {
  AppData,
  Grade,
  Subject,
  Chapter,
  ChapterProgress,
  CompletionStatus,
  SyncState
} from './types';
import {
  getInitialData,
  saveData,
  subscribeToTabSync,
  getProgressKey,
  calculateGradeProgress,
  calculateSubjectProgress
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { SubjectBar } from './components/SubjectBar';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { ChapterRow } from './components/ChapterRow';
import { ChapterDetailModal } from './components/ChapterDetailModal';
import { ExportModal } from './components/ExportModal';
import { AddCustomModal } from './components/AddCustomModal';
import { PrintableView } from './components/PrintableView';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // App data state
  const [appData, setAppData] = useState<AppData>(() => getInitialData());
  const [selectedGradeId, setSelectedGradeId] = useState<string>('class-10');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('c10-maths');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | CompletionStatus>('all');
  const [onlyWithNotes, setOnlyWithNotes] = useState<boolean>(false);

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced'
  );

  // Modals state
  const [activeChapterForModal, setActiveChapterForModal] = useState<Chapter | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Synchronize theme class on document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Online / Offline event listeners
  useEffect(() => {
    const handleOnline = () => setSyncState('synced');
    const handleOffline = () => setSyncState('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Multi-tab sync subscription
    const unsubscribe = subscribeToTabSync(() => {
      setSyncState('syncing');
      const latest = getInitialData();
      setAppData(latest);
      setTimeout(() => setSyncState('synced'), 400);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  // Keyboard shortcut listener ('/' for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement | null;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current Grade & Subject
  const currentGrade = useMemo(() => {
    return appData.grades.find((g) => g.id === selectedGradeId) || appData.grades[0];
  }, [appData.grades, selectedGradeId]);

  // Ensure current subject is valid for the current grade
  useEffect(() => {
    if (currentGrade && !currentGrade.subjects.some((s) => s.id === selectedSubjectId)) {
      if (currentGrade.subjects[0]) {
        setSelectedSubjectId(currentGrade.subjects[0].id);
      }
    }
  }, [currentGrade, selectedSubjectId]);

  const currentSubject = useMemo(() => {
    if (!currentGrade) return null;
    return currentGrade.subjects.find((s) => s.id === selectedSubjectId) || currentGrade.subjects[0] || null;
  }, [currentGrade, selectedSubjectId]);

  // Handle grade change
  const handleSelectGrade = (gradeId: string) => {
    setSelectedGradeId(gradeId);
    const targetGrade = appData.grades.find((g) => g.id === gradeId);
    if (targetGrade && targetGrade.subjects[0]) {
      setSelectedSubjectId(targetGrade.subjects[0].id);
    }
  };

  // Mutate and save progress
  const updateProgress = useCallback(
    (chapterId: string, partial: Partial<ChapterProgress>) => {
      setSyncState('syncing');
      const key = getProgressKey(selectedGradeId, currentSubject?.id || '', chapterId);
      const existing = appData.progress[key] || {
        chapterId,
        gradeId: selectedGradeId,
        subjectId: currentSubject?.id || '',
        status: 'not_started' as CompletionStatus,
        checklist: {
          ncertTheory: false,
          inTextQuestions: false,
          backExercises: false,
          exemplarProblems: false,
          previousYearQuestions: false,
          formulaOrSummaryNotes: false,
          mockTestOrSamplePaper: false,
        },
        notes: '',
        difficulty: 3,
        confidence: 1,
        revisionsCount: 0,
        updatedAt: new Date().toISOString(),
      };

      const updatedProgress: ChapterProgress = {
        ...existing,
        ...partial,
        updatedAt: new Date().toISOString(),
      };

      const nextData: AppData = {
        ...appData,
        progress: {
          ...appData.progress,
          [key]: updatedProgress,
        },
      };

      setAppData(nextData);
      saveData(nextData);

      setTimeout(() => {
        setSyncState(navigator.onLine ? 'synced' : 'offline');
      }, 300);
    },
    [appData, selectedGradeId, currentSubject]
  );

  // Cycle chapter status
  const handleToggleStatus = (chapterId: string, currentStatus: CompletionStatus) => {
    let nextStatus: CompletionStatus;
    if (currentStatus === 'not_started') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else if (currentStatus === 'completed') nextStatus = 'revised';
    else nextStatus = 'not_started';

    const updates: Partial<ChapterProgress> = { status: nextStatus };
    if (nextStatus === 'completed' || nextStatus === 'revised') {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    updateProgress(chapterId, updates);
  };

  // Quick increment revision count
  const handleIncrementRevision = (chapterId: string) => {
    const key = getProgressKey(selectedGradeId, currentSubject?.id || '', chapterId);
    const existing = appData.progress[key];
    const currentCount = existing?.revisionsCount || 0;
    const today = new Date().toISOString().split('T')[0];

    updateProgress(chapterId, {
      revisionsCount: currentCount + 1,
      lastRevisedDate: today,
      status: 'revised',
    });
  };

  // Add custom chapter
  const handleAddChapter = (
    subjectId: string,
    chapterName: string,
    unitName?: string,
    weightage?: string
  ) => {
    const newChapterId = `custom-ch-${Date.now()}`;
    const newChapter: Chapter = {
      id: newChapterId,
      name: chapterName,
      unitName,
      weightageEstimate: weightage,
    };

    const updatedGrades = appData.grades.map((grade) => {
      if (grade.id !== selectedGradeId) return grade;
      return {
        ...grade,
        subjects: grade.subjects.map((sub) => {
          if (sub.id !== subjectId) return sub;
          return {
            ...sub,
            chapters: [...sub.chapters, newChapter],
          };
        }),
      };
    });

    const nextData: AppData = {
      ...appData,
      grades: updatedGrades,
    };

    setAppData(nextData);
    saveData(nextData);
  };

  // Add custom subject
  const handleAddSubject = (subjectName: string, code?: string) => {
    const newSubjectId = `custom-sub-${Date.now()}`;
    const newSubject: Subject = {
      id: newSubjectId,
      name: subjectName,
      code,
      chapters: [
        {
          id: `custom-ch-${Date.now()}-1`,
          name: 'Chapter 1: Overview & Foundation',
          unitName: 'Unit 1',
        },
      ],
    };

    const updatedGrades = appData.grades.map((grade) => {
      if (grade.id !== selectedGradeId) return grade;
      return {
        ...grade,
        subjects: [...grade.subjects, newSubject],
      };
    });

    const nextData: AppData = {
      ...appData,
      grades: updatedGrades,
    };

    setAppData(nextData);
    saveData(nextData);
    setSelectedSubjectId(newSubjectId);
  };

  // Filtered chapters for active subject
  const filteredChapters = useMemo(() => {
    if (!currentSubject) return [];
    return currentSubject.chapters.filter((ch) => {
      const key = getProgressKey(selectedGradeId, currentSubject.id, ch.id);
      const p = appData.progress[key];

      // Status filter
      if (statusFilter !== 'all') {
        const itemStatus = p?.status || 'not_started';
        if (itemStatus !== statusFilter) return false;
      }

      // Notes filter
      if (onlyWithNotes) {
        if (!p?.notes || !p.notes.trim()) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = ch.name.toLowerCase().includes(query);
        const matchesUnit = ch.unitName?.toLowerCase().includes(query) || false;
        const matchesNotes = p?.notes?.toLowerCase().includes(query) || false;
        if (!matchesName && !matchesUnit && !matchesNotes) return false;
      }

      return true;
    });
  }, [currentSubject, selectedGradeId, appData.progress, statusFilter, onlyWithNotes, searchQuery]);

  // Overall grade statistics
  const gradeStats = useMemo(() => {
    if (!currentGrade) return { completed: 0, total: 0, percentage: 0 };
    return calculateGradeProgress(currentGrade, appData.progress);
  }, [currentGrade, appData.progress]);

  // Progress for modal chapter
  const modalProgress = useMemo(() => {
    if (!activeChapterForModal || !currentSubject) return undefined;
    const key = getProgressKey(selectedGradeId, currentSubject.id, activeChapterForModal.id);
    return appData.progress[key];
  }, [activeChapterForModal, selectedGradeId, currentSubject, appData.progress]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Navbar */}
      <div className="no-print">
        <Navbar
          grades={appData.grades}
          selectedGradeId={selectedGradeId}
          onSelectGrade={handleSelectGrade}
          isDark={isDark}
          onToggleDark={() => setIsDark(!isDark)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          syncState={syncState}
          onOpenExport={() => setIsExportModalOpen(true)}
          overallPercentage={gradeStats.percentage}
          completedChapters={gradeStats.completed}
          totalChapters={gradeStats.total}
        />
      </div>

      {/* Subject Navigation Bar */}
      <div className="no-print">
        {currentGrade && (
          <SubjectBar
            subjects={currentGrade.subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
            gradeId={selectedGradeId}
            progress={appData.progress}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}
      </div>

      {/* Main Content Area */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Subject Overview & Analytics Header */}
        {currentSubject && (
          <AnalyticsOverview
            subject={currentSubject}
            gradeId={selectedGradeId}
            progress={appData.progress}
          />
        )}

        {/* Action Controls & Filter Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Chapters' },
              { id: 'not_started', label: 'Not Started' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'revised', label: 'Revised' },
            ].map((f) => {
              const isActive = statusFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-2xs'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}

            {/* Toggle filter for chapters with notes */}
            <button
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                onlyWithNotes
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Show only chapters where you have recorded completion notes or strategies"
            >
              <FileText className="w-3 h-3" />
              <span>Has Notes</span>
            </button>
          </div>

          {/* Quick Stats on filtered items */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <span>
              Showing {filteredChapters.length} of {currentSubject?.chapters.length || 0} chapters
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>

        </div>

        {/* Chapter List */}
        {filteredChapters.length > 0 ? (
          <div className="space-y-2.5">
            {filteredChapters.map((chapter, idx) => {
              const key = getProgressKey(selectedGradeId, currentSubject?.id || '', chapter.id);
              const progress = appData.progress[key];

              return (
                <ChapterRow
                  key={chapter.id}
                  index={idx + 1}
                  chapter={chapter}
                  progress={progress}
                  onOpenDetails={(ch) => setActiveChapterForModal(ch)}
                  onToggleStatus={handleToggleStatus}
                  onIncrementRevision={handleIncrementRevision}
                />
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="p-12 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-white/40 dark:bg-neutral-900/30">
            <BookOpen className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No matching chapters found
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or status filter, or add a custom chapter to this subject.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {(searchQuery || statusFilter !== 'all' || onlyWithNotes) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setOnlyWithNotes(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 cursor-pointer"
              >
                + Add Chapter
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Print View for PDF / Study desk printing */}
      {currentGrade && (
        <PrintableView grade={currentGrade} progress={appData.progress} />
      )}

      {/* Chapter Detail & Completion Notes Modal */}
      <ChapterDetailModal
        isOpen={activeChapterForModal !== null}
        onClose={() => setActiveChapterForModal(null)}
        chapter={activeChapterForModal}
        gradeName={currentGrade?.name || ''}
        subjectName={currentSubject?.name || ''}
        progress={modalProgress}
        onSaveProgress={(updates) => {
          if (activeChapterForModal) {
            updateProgress(activeChapterForModal.id, updates);
          }
        }}
      />

      {/* Export & Offline Sync Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        appData={appData}
        selectedGradeId={selectedGradeId}
        onImportSuccess={(restored) => {
          setAppData(restored);
        }}
      />

      {/* Add Custom Chapter / Subject Modal */}
      {currentGrade && (
        <AddCustomModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          subjects={currentGrade.subjects}
          currentSubjectId={selectedSubjectId}
          gradeName={currentGrade.name}
          onAddChapter={handleAddChapter}
          onAddSubject={handleAddSubject}
        />
      )}

      {/* Minimal Footer */}
      <footer className="no-print border-t border-neutral-200/80 dark:border-neutral-800/80 py-4 bg-white/40 dark:bg-neutral-950/40 text-center text-xs text-neutral-400 font-mono">
        CBSE Official Portion &amp; Revision Log • All data stored locally offline
      </footer>

    </div>
  );
}
