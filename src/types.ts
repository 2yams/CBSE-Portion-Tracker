export type CompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'revised';

export interface ChecklistStep {
  ncertTheory: boolean;          // Read NCERT theory line by line
  inTextQuestions: boolean;      // In-text & worked examples solved
  backExercises: boolean;        // Back of chapter exercises
  exemplarProblems: boolean;     // NCERT Exemplar / HOTS
  previousYearQuestions: boolean;// 5-10 years CBSE Board PYQs
  formulaOrSummaryNotes: boolean;// Mindmap / formula sheet drafted
  mockTestOrSamplePaper: boolean;// Chapter test / sample papers
}

export interface Chapter {
  id: string;
  name: string;
  unitNumber?: number | string;
  unitName?: string;
  estimatedHours?: number;
  weightageEstimate?: string;
}

export interface ChapterProgress {
  chapterId: string;
  gradeId: string;
  subjectId: string;
  status: CompletionStatus;
  checklist: ChecklistStep;
  notes: string;                // Detailed notes on how it was completed
  difficulty: number;           // 1-5
  confidence: number;           // 1-5
  completedDate?: string;       // ISO date
  targetDate?: string;          // ISO date
  revisionsCount: number;
  lastRevisedDate?: string;
  keyConcepts?: string;
  updatedAt: string;            // ISO timestamp
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  stream?: 'all' | 'science' | 'commerce' | 'humanities';
  chapters: Chapter[];
}

export interface Grade {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: 'all' | CompletionStatus;
  sortBy: 'default' | 'name' | 'confidence' | 'updatedAt';
  hideCompleted: boolean;
}

export interface AppData {
  version: number;
  grades: Grade[];
  progress: Record<string, ChapterProgress>; // key: `${gradeId}_${subjectId}_${chapterId}`
  lastSyncedAt: string;
}

export type SyncState = 'synced' | 'syncing' | 'offline';
