import React, { useState } from 'react';
import { X, Plus, BookOpen, PlusCircle } from 'lucide-react';
import { Subject } from '../types';

interface AddCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  currentSubjectId: string;
  gradeName: string;
  onAddChapter: (subjectId: string, chapterName: string, unitName?: string, weightage?: string) => void;
  onAddSubject: (subjectName: string, code?: string) => void;
}

export const AddCustomModal: React.FC<AddCustomModalProps> = ({
  isOpen,
  onClose,
  subjects,
  currentSubjectId,
  gradeName,
  onAddChapter,
  onAddSubject,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'chapter' | 'subject'>('chapter');

  // Chapter form state
  const [selectedSubject, setSelectedSubject] = useState(currentSubjectId || (subjects[0]?.id || ''));
  const [chapterName, setChapterName] = useState('');
  const [unitName, setUnitName] = useState('');
  const [weightage, setWeightage] = useState('');

  // Subject form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'chapter') {
      if (!chapterName.trim() || !selectedSubject) return;
      onAddChapter(selectedSubject, chapterName.trim(), unitName.trim() || undefined, weightage.trim() || undefined);
    } else {
      if (!newSubjectName.trim()) return;
      onAddSubject(newSubjectName.trim(), subjectCode.trim() || undefined);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Customize Curriculum ({gradeName})
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Add custom chapters or additional CBSE electives.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-800/40 p-1">
          <button
            type="button"
            onClick={() => setMode('chapter')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'chapter'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            + Add Chapter / Topic
          </button>
          <button
            type="button"
            onClick={() => setMode('subject')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
              mode === 'subject'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            + Add Subject / Elective
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {mode === 'chapter' ? (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Target Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Chapter / Topic Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carbon Compounds Revision Test"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder-neutral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Unit / Module (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 2 - Organic"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Marks / Weightage (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Marks"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder-neutral-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hindi Course A, Sanskrit, Physical Education..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  CBSE Subject Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 002, 048, 083..."
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none placeholder-neutral-400"
                />
              </div>

              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                You can add individual chapters to this new subject immediately after creating it.
              </p>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white/90 transition-colors cursor-pointer shadow-xs"
            >
              {mode === 'chapter' ? 'Add Chapter' : 'Add Subject'}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
