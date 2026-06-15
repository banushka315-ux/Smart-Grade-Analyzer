export interface StudentData {
  name: string;
  subjects: Record<string, number>;
  grades: Record<string, string>;
  average: number;
  averageGrade: string;
}

export interface SubjectGradeDistribution {
  subject: string;
  distribution: Record<string, number>;
}

export interface Insight {
  type: 'positive' | 'negative' | 'neutral';
  subject: string;
  message: string;
}

export const GRADE_SCALE: [number, number, string][] = [
  [90, 100, 'A+'],
  [80, 89, 'A'],
  [70, 79, 'B+'],
  [60, 69, 'B'],
  [50, 59, 'C+'],
  [0, 49, 'C'],
];

export function assignGrade(marks: number): string {
  for (const [min, max, grade] of GRADE_SCALE) {
    if (marks >= min && marks <= max) return grade as string;
  }
  return 'C';
}

export const SUBJECT_MAPPING: Record<string, string> = {
  'BTE21001': 'Engineering Mathematics-1',
  'BTE22010': 'Engineering Physics',
  'BTE21405': 'Software Foundation and Programming with C++',
  'BTE22265': 'BBE',
  'BTE23018': 'Biology for Engineers',
  'BTE21427': 'Computer Aided Engineering Graphics',
  'BTE21428': 'Sports and Yoga / NSS / NCC',
  'BTE22014': 'Engineering Physics Laboratory',
  'BTE22266': 'BBE Laboratory',
  'BTE21406': 'Software Foundation and Programming (C++) Laboratory',
  'BTE21429': 'CAEG Laboratory'
};

export function normalizeSubjectName(rawSubject: string): string {
  const cleanStr = rawSubject.replace(/\s+/g, '').toUpperCase();
  const lowerStr = rawSubject.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const code of Object.keys(SUBJECT_MAPPING)) {
    if (cleanStr.includes(code.toUpperCase())) {
      return SUBJECT_MAPPING[code];
    }
  }

  if (lowerStr.includes('math')) return SUBJECT_MAPPING['BTE21001'];
  if (lowerStr.includes('physicslab')) return SUBJECT_MAPPING['BTE22014'];
  if (lowerStr.includes('physics')) return SUBJECT_MAPPING['BTE22010'];
  if (lowerStr.includes('c++lab') || lowerStr.includes('programminglab') || lowerStr.includes('softwarelab')) return SUBJECT_MAPPING['BTE21406'];
  if (lowerStr.includes('c++') || lowerStr.includes('software')) return SUBJECT_MAPPING['BTE21405'];
  if (lowerStr.includes('bbelab')) return SUBJECT_MAPPING['BTE22266'];
  if (lowerStr.includes('bbe')) return SUBJECT_MAPPING['BTE22265'];
  if (lowerStr.includes('biology')) return SUBJECT_MAPPING['BTE23018'];
  if (lowerStr.includes('caeglab') || lowerStr.includes('graphiclab')) return SUBJECT_MAPPING['BTE21429'];
  if (lowerStr.includes('graphics') || lowerStr.includes('caeg') || lowerStr.includes('compoter') || lowerStr.includes('engineeringgraphics')) return SUBJECT_MAPPING['BTE21427'];
  if (lowerStr.includes('sports') || lowerStr.includes('yoga') || lowerStr.includes('nss') || lowerStr.includes('ncc')) return SUBJECT_MAPPING['BTE21428'];

  return rawSubject.trim();
}

export function processExcelData(rawInputData: Record<string, unknown>[]): {
  students: StudentData[];
  subjects: string[];
} {
  if (rawInputData.length === 0) return { students: [], subjects: [] };

  let rawData = [...rawInputData];
  let headerRowIndex = -1;

  // Try to find if the headers are actually in the data rows (e.g., if there was a title row above them)
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const values = Object.values(rawData[i]).map(v => String(v).toLowerCase());
    if (values.some(v => v.includes('name') || v.includes('student'))) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex !== -1) {
    const headerMap = rawData[headerRowIndex];
    const newData = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const newRow: Record<string, unknown> = {};
      for (const k of Object.keys(rawData[i])) {
        if (headerMap[k]) {
          newRow[String(headerMap[k])] = rawData[i][k];
        }
      }
      if (Object.keys(newRow).length > 0) newData.push(newRow);
    }
    rawData = newData;
  }

  if (rawData.length === 0) return { students: [], subjects: [] };

  const keysSet = new Set<string>();
  rawData.forEach(row => {
    Object.keys(row).forEach(k => keysSet.add(k));
  });
  const keys = Array.from(keysSet);
  const nameKey = keys.find(
    (k) => k.toLowerCase().includes('name') || k.toLowerCase().includes('student')
  ) || keys[0];

  const subjectKeys = keys.filter((k) => k !== nameKey);
  // normalize headers
  const subjectMap = subjectKeys.reduce((acc, k) => {
    acc[k] = normalizeSubjectName(k);
    return acc;
  }, {} as Record<string, string>);

  const subjects = Array.from(new Set(Object.values(subjectMap)));

  const students: StudentData[] = rawData.map((row) => {
    const name = String(row[nameKey] ?? '');
    const subjectMarks: Record<string, number> = {};
    const subjectGrades: Record<string, string> = {};

    for (const rawSubKey of subjectKeys) {
      const normalizedSub = subjectMap[rawSubKey];
      const val = row[rawSubKey];
      let marks = 0;
      if (typeof val === 'number') {
        marks = val;
      } else if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) marks = parsed;
      }
      subjectMarks[normalizedSub] = marks;
      subjectGrades[normalizedSub] = assignGrade(marks);
    }

    const marksArr = Object.values(subjectMarks);
    const average =
      marksArr.length > 0
        ? Math.round((marksArr.reduce((a, b) => a + b, 0) / marksArr.length) * 100) / 100
        : 0;

    return {
      name,
      subjects: subjectMarks,
      grades: subjectGrades,
      average,
      averageGrade: assignGrade(average),
    };
  });

  return { students, subjects };
}

export function getSubjectGradeDistribution(
  students: StudentData[],
  subjects: string[]
): SubjectGradeDistribution[] {
  const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C'];

  return subjects.map((subject) => {
    const distribution: Record<string, number> = {};
    for (const g of gradeOrder) distribution[g] = 0;

    for (const student of students) {
      const grade = student.grades[subject] || 'C';
      distribution[grade] = (distribution[grade] || 0) + 1;
    }

    return { subject, distribution };
  });
}

export function getTopPerformers(students: StudentData[], count = 5): StudentData[] {
  return [...students].sort((a, b) => b.average - a.average).slice(0, count);
}

export function getNeedsImprovement(students: StudentData[], threshold = 50): StudentData[] {
  return students.filter((s) => s.average < threshold);
}

export function generateInsights(
  students: StudentData[],
  subjects: string[]
): Insight[] {
  const insights: Insight[] = [];
  const distributions = getSubjectGradeDistribution(students, subjects);

  for (const dist of distributions) {
    const totalStudents = Object.values(dist.distribution).reduce((a, b) => a + b, 0);
    const topGrades = (dist.distribution['A+'] || 0) + (dist.distribution['A'] || 0);
    const lowCount = dist.distribution['C'] || 0;
    const topPercent = Math.round((topGrades / totalStudents) * 100);
    const lowPercent = Math.round((lowCount / totalStudents) * 100);

    const subjectAverages = students.map((s) => s.subjects[dist.subject] || 0);
    const avg = Math.round(
      (subjectAverages.reduce((a, b) => a + b, 0) / subjectAverages.length) * 10
    ) / 10;

    if (topPercent >= 50) {
      insights.push({
        type: 'positive',
        subject: dist.subject,
        message: `${topPercent}% of students scored A or A+ in ${dist.subject} (avg: ${avg})`,
      });
    }

    if (lowPercent >= 30) {
      insights.push({
        type: 'negative',
        subject: dist.subject,
        message: `${lowPercent}% of students scored C in ${dist.subject} — needs attention`,
      });
    }

    if (topPercent < 50 && lowPercent < 30) {
      insights.push({
        type: 'neutral',
        subject: dist.subject,
        message: `Mixed performance in ${dist.subject} — avg score: ${avg}`,
      });
    }
  }

  const overallAvg =
    Math.round(
      (students.reduce((a, s) => a + s.average, 0) / students.length) * 10
    ) / 10;

  if (overallAvg >= 75) {
    insights.push({
      type: 'positive',
      subject: 'Overall',
      message: `Class average is ${overallAvg} — strong overall performance`,
    });
  } else if (overallAvg < 55) {
    insights.push({
      type: 'negative',
      subject: 'Overall',
      message: `Class average is only ${overallAvg} — significant improvement needed`,
    });
  } else {
    insights.push({
      type: 'neutral',
      subject: 'Overall',
      message: `Class average is ${overallAvg} — moderate performance across subjects`,
    });
  }

  return insights;
}

