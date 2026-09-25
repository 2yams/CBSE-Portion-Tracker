import { AppData, Grade, ChapterProgress, CompletionStatus } from '../types';
import { DEFAULT_GRADES, DEFAULT_CHECKLIST, SEED_PROGRESS } from '../data/defaultCurriculum';

const STORAGE_KEY = 'cbse_portion_tracker_v1';
const SYNC_CHANNEL_NAME = 'cbse_sync_channel';

export function getInitialData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      if (parsed && parsed.grades && parsed.progress) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse existing data, falling back to defaults', e);
  }

  // Generate seed records
  const initialProgress: Record<string, ChapterProgress> = {};
  const now = new Date().toISOString();

  // Populate default empty progress for class-10, class-12, etc.
  DEFAULT_GRADES.forEach((grade) => {
    grade.subjects.forEach((subject) => {
      subject.chapters.forEach((chapter) => {
        const key = `${grade.id}_${subject.id}_${chapter.id}`;
        const seed = SEED_PROGRESS[key];
        initialProgress[key] = {
          chapterId: chapter.id,
          gradeId: grade.id,
          subjectId: subject.id,
          status: seed?.status || 'not_started',
          checklist: seed?.checklist ? { ...seed.checklist } : { ...DEFAULT_CHECKLIST },
          notes: seed?.notes || '',
          difficulty: seed?.difficulty || 3,
          confidence: seed?.confidence || 1,
          completedDate: seed?.completedDate,
          targetDate: seed?.targetDate,
          revisionsCount: seed?.revisionsCount || 0,
          lastRevisedDate: seed?.lastRevisedDate,
          updatedAt: now,
        };
      });
    });
  });

  const initialData: AppData = {
    version: 1,
    grades: DEFAULT_GRADES,
    progress: initialProgress,
    lastSyncedAt: now,
  };

  saveData(initialData);
  return initialData;
}

export function saveData(data: AppData): void {
  try {
    const updatedData = {
      ...data,
      lastSyncedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

    // Broadcast change across tabs
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: 'DATA_SYNC', timestamp: Date.now() });
        channel.close();
      } catch {
        // broadcast fallback ignored
      }
    }
  } catch (e) {
    console.error('Error saving to local storage:', e);
  }
}

export function subscribeToTabSync(onSync: () => void): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }
  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  channel.onmessage = (event) => {
    if (event.data?.type === 'DATA_SYNC') {
      onSync();
    }
  };
  return () => {
    channel.close();
  };
}

export function getProgressKey(gradeId: string, subjectId: string, chapterId: string): string {
  return `${gradeId}_${subjectId}_${chapterId}`;
}

export function calculateSubjectProgress(
  chapters: { id: string }[],
  gradeId: string,
  subjectId: string,
  progress: Record<string, ChapterProgress>
): { completed: number; inProgress: number; total: number; percentage: number; revised: number } {
  const total = chapters.length;
  if (total === 0) return { completed: 0, inProgress: 0, total: 0, percentage: 0, revised: 0 };

  let completed = 0;
  let inProgress = 0;
  let revised = 0;

  chapters.forEach((ch) => {
    const key = getProgressKey(gradeId, subjectId, ch.id);
    const p = progress[key];
    if (p) {
      if (p.status === 'completed' || p.status === 'revised') {
        completed++;
      }
      if (p.status === 'revised') {
        revised++;
      }
      if (p.status === 'in_progress') {
        inProgress++;
      }
    }
  });

  const percentage = Math.round((completed / total) * 100);
  return { completed, inProgress, total, percentage, revised };
}

export function calculateGradeProgress(
  grade: Grade,
  progress: Record<string, ChapterProgress>
): { completed: number; total: number; percentage: number; revised: number } {
  let total = 0;
  let completed = 0;
  let revised = 0;

  grade.subjects.forEach((s) => {
    s.chapters.forEach((ch) => {
      total++;
      const key = getProgressKey(grade.id, s.id, ch.id);
      const p = progress[key];
      if (p) {
        if (p.status === 'completed' || p.status === 'revised') {
          completed++;
        }
        if (p.status === 'revised') {
          revised++;
        }
      }
    });
  });

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage, revised };
}

// ---------------- EXPORT UTILITIES ----------------

export function exportToJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `cbse-portion-tracker-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCsv(grades: Grade[], progress: Record<string, ChapterProgress>): void {
  const headers = [
    'Grade',
    'Subject',
    'Subject Code',
    'Unit',
    'Chapter Name',
    'Status',
    'NCERT Theory Read',
    'In-Text Done',
    'Back Exercises Done',
    'Exemplar Solved',
    'PYQs Solved',
    'Formula / Revision Notes',
    'Mock Test Given',
    'Confidence (1-5)',
    'Difficulty (1-5)',
    'Revisions Done',
    'Date Completed',
    'Last Revised',
    'Completion Notes',
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return '""';
    return `"${str.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  };

  const rows: string[] = [headers.join(',')];

  grades.forEach((grade) => {
    grade.subjects.forEach((subject) => {
      subject.chapters.forEach((chapter) => {
        const key = getProgressKey(grade.id, subject.id, chapter.id);
        const p = progress[key];
        const checklist = p?.checklist || DEFAULT_CHECKLIST;

        const row = [
          escapeCsv(grade.name),
          escapeCsv(subject.name),
          escapeCsv(subject.code || '-'),
          escapeCsv(chapter.unitName || '-'),
          escapeCsv(chapter.name),
          escapeCsv(p?.status || 'not_started'),
          checklist.ncertTheory ? 'YES' : 'NO',
          checklist.inTextQuestions ? 'YES' : 'NO',
          checklist.backExercises ? 'YES' : 'NO',
          checklist.exemplarProblems ? 'YES' : 'NO',
          checklist.previousYearQuestions ? 'YES' : 'NO',
          checklist.formulaOrSummaryNotes ? 'YES' : 'NO',
          checklist.mockTestOrSamplePaper ? 'YES' : 'NO',
          p?.confidence || 1,
          p?.difficulty || 3,
          p?.revisionsCount || 0,
          escapeCsv(p?.completedDate || '-'),
          escapeCsv(p?.lastRevisedDate || '-'),
          escapeCsv(p?.notes || ''),
        ];
        rows.push(row.join(','));
      });
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `cbse-portion-tracker-report-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(grades: Grade[], progress: Record<string, ChapterProgress>, selectedGradeId?: string): string {
  const filteredGrades = selectedGradeId ? grades.filter((g) => g.id === selectedGradeId) : grades;
  const lines: string[] = [];

  lines.push('# CBSE Syllabus Completion & Revision Portfolio');
  lines.push(`_Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}_\n`);

  filteredGrades.forEach((grade) => {
    const overall = calculateGradeProgress(grade, progress);
    lines.push(`## ${grade.name} (${overall.percentage}% Completed - ${overall.completed}/${overall.total} Chapters)`);
    lines.push('');

    grade.subjects.forEach((subject) => {
      const subjProgress = calculateSubjectProgress(subject.chapters, grade.id, subject.id, progress);
      lines.push(`### ${subject.name} (${subjProgress.percentage}% | ${subjProgress.completed}/${subjProgress.total})`);
      lines.push('');

      subject.chapters.forEach((ch, idx) => {
        const key = getProgressKey(grade.id, subject.id, ch.id);
        const p = progress[key];
        const statusIcon = p?.status === 'revised' ? '🟣 Revised' : p?.status === 'completed' ? '✅ Completed' : p?.status === 'in_progress' ? '⏳ In Progress' : '⚪ Not Started';
        lines.push(`#### ${idx + 1}. ${ch.name} [${statusIcon}]`);
        if (ch.unitName) lines.push(`- **Unit**: ${ch.unitName}`);
        if (p?.confidence) lines.push(`- **Confidence**: ${'⭐'.repeat(p.confidence)} (${p.confidence}/5)`);
        if (p?.completedDate) lines.push(`- **Completed On**: ${p.completedDate}`);
        if (p?.revisionsCount) lines.push(`- **Revisions Count**: ${p.revisionsCount}`);

        const completedItems = [];
        if (p?.checklist.ncertTheory) completedItems.push('NCERT Theory');
        if (p?.checklist.inTextQuestions) completedItems.push('In-Text Questions');
        if (p?.checklist.backExercises) completedItems.push('Back Exercises');
        if (p?.checklist.exemplarProblems) completedItems.push('Exemplar');
        if (p?.checklist.previousYearQuestions) completedItems.push('PYQs');
        if (p?.checklist.formulaOrSummaryNotes) completedItems.push('Summary Notes');
        if (p?.checklist.mockTestOrSamplePaper) completedItems.push('Mock Test');

        if (completedItems.length > 0) {
          lines.push(`- **Milestones Cleared**: ${completedItems.join(', ')}`);
        }

        if (p?.notes && p.notes.trim()) {
          lines.push('');
          lines.push('**How I Completed This Chapter / Notes:**');
          lines.push('> ' + p.notes.split('\n').join('\n> '));
        }
        lines.push('');
      });
      lines.push('---');
    });
  });

  return lines.join('\n');
}

export function downloadMarkdownFile(content: string, filename = 'cbse-portion-tracker.md'): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJson(jsonString: string): AppData {
  const parsed = JSON.parse(jsonString);
  if (!parsed || !Array.isArray(parsed.grades) || typeof parsed.progress !== 'object') {
    throw new Error('Invalid backup format. File must contain grades and progress data.');
  }

  const validatedData: AppData = {
    version: parsed.version || 1,
    grades: parsed.grades,
    progress: parsed.progress,
    lastSyncedAt: new Date().toISOString(),
  };

  saveData(validatedData);
  return validatedData;
}
