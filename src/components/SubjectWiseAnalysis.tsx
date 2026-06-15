import { CheckCircle2 } from 'lucide-react';
import { AnalysisData } from '../types';

interface Props {
  data: AnalysisData;
  theme: 'light' | 'dark';
}

export default function SubjectWiseAnalysis({ data, theme }: Props) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-darkCard border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
      <div className="p-6 border-b border-inherit">
        <h3 className="text-lg font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-500"/> Subject-Wise Analysis</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={`${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Sr No</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Subject Name (Code)</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">TH/PR</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Appeared</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Passed</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Passing %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {data.subjectWiseAnalysis.map((sub, i) => (
              <tr key={i} className={`hover:bg-slate-500/5 transition-colors`}>
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4 font-semibold">{sub.subjectCode}</td>
                <td className="px-6 py-4 text-center font-medium">
                  <span className={`px-2 py-1 rounded text-xs ${sub.type === 'PR' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {sub.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{sub.appeared}</td>
                <td className="px-6 py-4 text-center">{sub.passed}</td>
                <td className="px-6 py-4 text-center font-bold text-emerald-500">{sub.passingPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
