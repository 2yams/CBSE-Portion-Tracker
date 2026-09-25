import React from 'react';
import { Grade, ChapterProgress } from '../types';
import { getProgressKey, calculateGradeProgress } from '../utils/storage';

interface PrintableViewProps {
  grade: Grade;
  progress: Record<string, ChapterProgress>;
}

export const PrintableView: React.FC<PrintableViewProps> = ({ grade, progress }) => {
  const overall = calculateGradeProgress(grade, progress);

  return (
    <div className="print-only p-8 text-black bg-white">
      {/* Printable Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight uppercase">CBSE Syllabus &amp; Revision Log</h1>
            <p className="text-sm text-neutral-600 mt-1">
              Target: {grade.name} • Official Portions Tracker
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono">
              Printed on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <div className="text-base font-bold font-mono mt-1">
              Progress: {overall.completed} / {overall.total} ({overall.percentage}%)
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Loop */}
      <div className="space-y-6">
        {grade.subjects.map((subject) => {
          return (
            <div key={subject.id} className="print-break-inside-avoid">
              <h2 className="text-base font-bold uppercase tracking-wider border-b border-neutral-400 pb-1 mb-2">
                {subject.name} {subject.code ? `(${subject.code})` : ''}
              </h2>

              <table className="w-full text-xs border-collapse text-left mb-4">
                <thead>
                  <tr className="border-b border-black text-[11px] font-bold">
                    <th className="py-1.5 w-8">#</th>
                    <th className="py-1.5 w-64">Chapter Name</th>
                    <th className="py-1.5 w-24">Status</th>
                    <th className="py-1.5 w-32">Checklist</th>
                    <th className="py-1.5 w-16">Conf.</th>
                    <th className="py-1.5">Student Completion Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {subject.chapters.map((ch, idx) => {
                    const key = getProgressKey(grade.id, subject.id, ch.id);
                    const p = progress[key];
                    const statusText =
                      p?.status === 'revised'
                        ? '[REVISED]'
                        : p?.status === 'completed'
                        ? '[COMPLETED]'
                        : p?.status === 'in_progress'
                        ? '[IN PROGRESS]'
                        : '[PENDING]';

                    const checklistStr = [
                      p?.checklist?.ncertTheory ? 'NCERT' : null,
                      p?.checklist?.inTextQuestions ? 'InText' : null,
                      p?.checklist?.backExercises ? 'BackEx' : null,
                      p?.checklist?.previousYearQuestions ? 'PYQs' : null,
                      p?.checklist?.formulaOrSummaryNotes ? 'Notes' : null,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-';

                    return (
                      <tr key={ch.id} className="border-b border-neutral-200 align-top">
                        <td className="py-2 font-mono">{idx + 1}</td>
                        <td className="py-2 pr-2 font-medium">
                          {ch.name}
                          {ch.unitName && (
                            <span className="block text-[10px] text-neutral-500">{ch.unitName}</span>
                          )}
                        </td>
                        <td className="py-2 font-mono text-[11px]">{statusText}</td>
                        <td className="py-2 text-[10px] text-neutral-600">{checklistStr}</td>
                        <td className="py-2 font-mono">{p?.confidence ? `${p.confidence}/5` : '-'}</td>
                        <td className="py-2 italic text-[11px] text-neutral-800 leading-snug">
                          {p?.notes ? p.notes : <span className="text-neutral-400">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
