import { BarChart3 } from 'lucide-react';
import { AnalysisData } from '../types';

interface Props {
  data: AnalysisData;
  theme: 'light' | 'dark';
}

export default function OverallSummary({ data, theme }: Props) {
  return (
    <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-darkCard border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500"/> Overall Result Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <p className="text-sm text-slate-500 mb-1">Appeared</p>
          <p className="text-3xl font-bold">{data.summary.totalAppeared}</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
          <p className="text-sm text-emerald-500 mb-1">Pass %</p>
          <p className="text-3xl font-bold text-emerald-500">{data.summary.passPercentage}%</p>
          <p className="text-xs text-emerald-600/70 mt-1">{data.summary.totalPass} students</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
          <p className="text-sm text-yellow-500 mb-1">Promoted %</p>
          <p className="text-3xl font-bold text-yellow-500">{data.summary.promotedPercentage}%</p>
          <p className="text-xs text-yellow-600/70 mt-1">{data.summary.totalPromoted} students</p>
        </div>
        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-rose-900/20' : 'bg-rose-50'}`}>
          <p className="text-sm text-rose-500 mb-1">Fail</p>
          <p className="text-3xl font-bold text-rose-500">{data.summary.totalFail}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Class Distribution</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-sm">Distinction ({'>'}80%)</span><span className="font-medium">{data.summary.classDistribution.distinction}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">First Class ({'>'}60%)</span><span className="font-medium">{data.summary.classDistribution.firstClass}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Second Class ({'>'}40%)</span><span className="font-medium">{data.summary.classDistribution.secondClass}</span></div>
          </div>
        </div>
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Failure Distribution</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center"><span className="text-sm">Failed in 1 subject</span><span className="font-medium">{data.summary.failureDistribution['1']}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Failed in 2 subjects</span><span className="font-medium">{data.summary.failureDistribution['2']}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Failed in 3 subjects</span><span className="font-medium">{data.summary.failureDistribution['3']}</span></div>
            <div className="flex justify-between items-center"><span className="text-sm">Failed in {'>'}3 subjects</span><span className="font-medium">{data.summary.failureDistribution['>3']}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
