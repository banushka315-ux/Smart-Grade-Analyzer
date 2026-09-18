import { useCallback, useRef, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { AnalysisData } from '../types';

interface FileUploadProps {
  onFileLoaded: (analysis: AnalysisData, fileName?: string) => void;
  isProcessing: boolean;
  onProcessingChange: (isProcessing: boolean) => void;
}

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
const uploadUrl = apiBaseUrl.endsWith('/api')
  ? `${apiBaseUrl}/upload`
  : apiBaseUrl
    ? `${apiBaseUrl}/api/upload`
    : '/api/upload';

export default function FileUpload({ onFileLoaded, isProcessing, onProcessingChange }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
        setError('Please upload an Excel or CSV file');
        return;
      }

      try {
        onProcessingChange(true);
        console.log('Uploading file', { name: file.name, type: file.type, size: file.size, uploadUrl });
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        console.log('Upload response received', { status: response.status, statusText: response.statusText });
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, response.statusText, errorText);
          throw new Error(errorText || 'Failed to analyze file');
        }

        const analysis: unknown = await response.json();
        const analysisRecord = analysis && typeof analysis === 'object'
          ? analysis as Record<string, unknown>
          : null;
        if (!analysisRecord || analysisRecord.error) {
          console.error('Invalid analysis response:', analysis);
          throw new Error(
            typeof analysisRecord?.error === 'string'
              ? analysisRecord.error
              : 'Invalid response from analysis server'
          );
        }

        console.log('Analysis result received', analysis);
        onFileLoaded(analysis as AnalysisData, file.name);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to upload and analyze the file.');
      } finally {
        onProcessingChange(false);
      }
    },
    [onFileLoaded, onProcessingChange]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processFile(e.dataTransfer.files[0]);
      }
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processFile(e.target.files[0]);
      }
    },
    [processFile]
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer group
          ${dragActive
            ? 'border-emerald-500 bg-emerald-50 scale-[1.02]'
            : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
          }
          ${isProcessing ? 'opacity-60 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${dragActive ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
            {isProcessing ? (
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            ) : dragActive ? (
              <FileSpreadsheet className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-700">
              {isProcessing ? 'Processing your file...' : 'Drop your Excel file here'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              or <span className="text-emerald-600 font-medium hover:underline">browse files</span>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Supports .xlsx and .xls formats</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
