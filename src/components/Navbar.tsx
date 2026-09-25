import React from 'react';
import { Moon, Sun, Download, Search, CheckCircle2, CloudOff, RefreshCw, BookOpen, Layers } from 'lucide-react';
import { Grade, SyncState } from '../types';

interface NavbarProps {
  grades: Grade[];
  selectedGradeId: string;
  onSelectGrade: (gradeId: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  syncState: SyncState;
  onOpenExport: () => void;
  overallPercentage: number;
  completedChapters: number;
  totalChapters: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  grades,
  selectedGradeId,
  onSelectGrade,
  isDark,
  onToggleDark,
  searchQuery,
  onSearchChange,
  syncState,
  onOpenExport,
  overallPercentage,
  completedChapters,
  totalChapters,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Grade Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-950 shadow-xs">
                <BookOpen className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 text-sm">CBSE PORTION</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">Tracker</span>
                </div>
              </div>
            </div>

            {/* Grade Switcher */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
              {grades.map((grade) => {
                const isActive = grade.id === selectedGradeId;
                return (
                  <button
                    key={grade.id}
                    onClick={() => onSelectGrade(grade.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      isActive
                        ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                    }`}
                  >
                    {grade.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xs relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search chapters, topics, notes... (/)"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 text-[11px] font-mono text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-800" title="Offline-ready local sync with instant persistence">
              {syncState === 'synced' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Offline Synced</span>
                </>
              )}
              {syncState === 'syncing' && (
                <>
                  <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                  <span>Saving...</span>
                </>
              )}
              {syncState === 'offline' && (
                <>
                  <CloudOff className="w-3 h-3 text-amber-500" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            {/* Quick Overall stats pill */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-800">
              <span>{overallPercentage}%</span>
              <span className="text-neutral-400 dark:text-neutral-600">|</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">{completedChapters}/{totalChapters}</span>
            </div>

            {/* Export & backup trigger */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-700 dark:text-neutral-200 transition-colors shadow-2xs cursor-pointer"
              title="Export, Print or Backup syllabus data"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={onToggleDark}
              className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
