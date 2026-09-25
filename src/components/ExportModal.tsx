import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  Printer,
  Upload,
  Check,
  AlertCircle,
  Copy,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { Grade, ChapterProgress, AppData } from '../types';
import {
  exportToCsv,
  exportToJson,
  exportToMarkdown,
  downloadMarkdownFile,
  importFromJson
} from '../utils/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppData;
  selectedGradeId: string;
  onImportSuccess: (importedData: AppData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  appData,
  selectedGradeId,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  const [copiedMd, setCopiedMd] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedGrade = appData.grades.find((g) => g.id === selectedGradeId);

  const handleExportCsv = () => {
    exportToCsv(appData.grades, appData.progress);
  };

  const handleExportJson = () => {
    exportToJson(appData);
  };

  const handleDownloadMarkdown = () => {
    const md = exportToMarkdown(appData.grades, appData.progress, selectedGradeId);
    downloadMarkdownFile(md, `cbse-${selectedGradeId}-portion-notes.md`);
  };

  const handleCopyMarkdown = () => {
    const md = exportToMarkdown(appData.grades, appData.progress, selectedGradeId);
    navigator.clipboard.writeText(md).then(() => {
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccessMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importFromJson(text);
        setImportSuccessMessage(`Successfully restored ${imported.grades.length} grades and ${Object.keys(imported.progress).length} chapter entries!`);
        onImportSuccess(imported);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err: any) {
        setImportError(err.message || 'Failed to import backup file. Please ensure it is a valid CBSE Portion Tracker JSON export.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Download className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Export &amp; Offline Data Sync
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Export study checklists, completion notes, and backup your tracker offline.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* CSV / Excel */}
            <button
              onClick={handleExportCsv}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left cursor-pointer group"
            >
              <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Spreadsheet (.CSV)
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                  Compatible with Excel &amp; Sheets. Includes all grades, checklist marks, and notes.
                </span>
              </div>
            </button>

            {/* Markdown Summary */}
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left cursor-pointer group"
            >
              <div className="p-2 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Markdown (.MD)
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                  Structured notes for Notion, Obsidian, or digital revision notebooks.
                </span>
              </div>
            </button>

            {/* JSON Backup */}
            <button
              onClick={handleExportJson}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left cursor-pointer group"
            >
              <div className="p-2 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Complete Backup (.JSON)
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                  Full state snapshot to restore on another laptop, tablet, or phone.
                </span>
              </div>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-left cursor-pointer group"
            >
              <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                  Print / Save PDF
                </span>
                <span className="block text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                  Clean printable view for your study desk or binder portfolio.
                </span>
              </div>
            </button>

          </div>

          {/* Quick Copy Markdown to Clipboard */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800">
            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              Copy <span className="font-semibold text-neutral-900 dark:text-neutral-100">{selectedGrade?.name || 'Current Grade'}</span> portion &amp; notes as Markdown
            </div>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>

          {/* Restore / Import Section */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Restore from Backup
            </h3>
            
            <div className="p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-white/90 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select .JSON Backup File</span>
              </button>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Restores your customized chapters, study notes, and completion checklist securely.
              </p>

              {importError && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-mono">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccessMessage && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Offline Sync Architecture Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/30 text-[11px] text-neutral-600 dark:text-neutral-400">
            <HardDrive className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">100% Offline-First Architecture: </span>
              Your data is stored locally in your browser's persistent storage with multi-tab real-time synchronization. No third-party servers see your study notes.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
