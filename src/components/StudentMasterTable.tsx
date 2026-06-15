import { GraduationCap } from 'lucide-react';
import { AnalysisData } from '../types';

interface Props {
  data: AnalysisData;
  theme: 'light' | 'dark';
}

export default function StudentMasterTable({ data, theme }: Props) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${theme === 'dark' ? 'bg-darkCard border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
      <div className="p-6 border-b border-inherit">
        <h3 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-blue-500"/> Student Master Table</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className={`${theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider whitespace-nowrap">Enrollment No</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider whitespace-nowrap min-w-[200px]">Name</th>
              {data.subjectWiseAnalysis.map(sub => (
                <th key={sub.subjectCode} className="px-6 py-4 font-medium uppercase tracking-wider text-center whitespace-nowrap">
                  {sub.subjectCode}
                </th>
              ))}
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">SGPA</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">CGPA</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-inherit">
            {data.students.map((student, i) => (
              <tr key={i} className={`hover:bg-slate-500/5 transition-colors ${student.result === 'FAIL' ? 'bg-rose-500/5' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">{student.enrollmentNo}</td>
                <td className="px-6 py-4 font-semibold whitespace-nowrap">{student.name}</td>
                {data.subjectWiseAnalysis.map(sub => {
                  const grade = student.grades[sub.subjectCode] || '-';
                  return (
                    <td key={sub.subjectCode} className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-300">
                      <span className={`px-2 py-1 rounded text-xs ${grade.includes('F') ? 'bg-rose-500/10 text-rose-500' : 'bg-slate-500/10'}`}>
                        {grade}
                      </span>
                    </td>
                  );
                })}
                <td className="px-6 py-4 font-mono text-center">{student.sgpa.toFixed(2)}</td>
                <td className="px-6 py-4 font-mono text-center">{student.cgpa.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold
                    ${student.result === 'PASS' ? 'bg-emerald-500/10 text-emerald-500' : 
                      student.result === 'PROMOTED' ? 'bg-yellow-500/10 text-yellow-600' : 
                      'bg-rose-500/10 text-rose-500'}`}>
                    {student.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
