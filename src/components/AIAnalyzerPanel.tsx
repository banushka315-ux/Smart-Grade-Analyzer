import { Sparkles, AlertTriangle, XCircle } from 'lucide-react';
import { AnalysisData } from '../types';

interface Props {
  data: AnalysisData;
  theme: 'light' | 'dark';
}

export default function AIAnalyzerPanel({ data, theme }: Props) {
  return (
    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200'} shadow-sm`}>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Sparkles className="w-5 h-5 text-indigo-500"/> AI Insights & Analytics</h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-3">Top Performers (SGPA)</h4>
          <div className="space-y-2">
            {data.insights.toppers.map((t, i) => (
              <div key={i} className={`flex justify-between items-center p-2 rounded ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white'}`}>
                <span className="text-sm font-medium">{t.name}</span>
                <span className="text-sm font-bold text-emerald-500">{t.sgpa.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-rose-600 dark:text-rose-400 mb-3">Actionable Suggestions</h4>
          <ul className="space-y-3">
            {data.insights.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
            {data.insights.atRisk.length > 0 && (
              <li className="flex gap-2 text-sm items-start text-rose-500">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{data.insights.atRisk.length} students are at severe risk (failed {'>='} 3 subjects). Need immediate counseling.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
