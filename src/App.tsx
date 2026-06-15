import { useState, useEffect } from 'react';
import { Moon, Sun, GraduationCap } from 'lucide-react';
import FileUpload from './components/FileUpload';
import VisualAnalytics from './components/VisualAnalytics';
import SubjectGradeDistribution from './components/SubjectGradeDistribution';
import OverallSummary from './components/OverallSummary';
import AIAnalyzerPanel from './components/AIAnalyzerPanel';
import SubjectWiseAnalysis from './components/SubjectWiseAnalysis';
import StudentMasterTable from './components/StudentMasterTable';
import { AnalysisData } from './types';

export default function App() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleFileLoaded = (analysis: AnalysisData) => {
    setData(analysis);
  };

  const reset = () => {
    setData(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-darkBg text-darkText' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`sticky top-0 z-50 border-b ${theme === 'dark' ? 'bg-darkCard/90 border-slate-700' : 'bg-white/90 border-slate-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI Result Dashboard</h1>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>University Gazette Analyzer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-slate-500/20 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            {data && (
              <button onClick={reset} className="px-4 py-2 text-sm font-medium bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!data ? (
          <div className="max-w-3xl mx-auto mt-12 text-center space-y-8">
            <h2 className={`text-4xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Automate University Results
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Upload your official Excel Gazette. Our AI engine will parse the subjects, calculate statistics, and generate actionable insights instantly.
            </p>
            <FileUpload
              onFileLoaded={handleFileLoaded}
              isProcessing={isProcessing}
              onProcessingChange={setIsProcessing}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Table A: Overall Summary */}
            <OverallSummary data={data} theme={theme} />

            {/* AI Analyzer Panel */}
            <AIAnalyzerPanel data={data} theme={theme} />

            {/* Visual Analytics */}
            <VisualAnalytics data={data} theme={theme} />

            {/* Table B: Subject-wise Analysis */}
            <SubjectWiseAnalysis data={data} theme={theme} />

            {/* New Feature: Subject Grade Distribution */}
            <SubjectGradeDistribution data={data} theme={theme} />

            {/* Table C: Student Master */}
            <StudentMasterTable data={data} theme={theme} />

          </div>
        )}
      </main>
    </div>
  );
}
