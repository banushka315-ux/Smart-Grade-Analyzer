export interface SubjectAnalysis {
  subjectCode: string;
  type: string;
  appeared: number;
  passed: number;
  passingPercentage: string;
  gradeDistribution: Record<string, number>;
}

export interface StudentResult {
  enrollmentNo: string;
  name: string;
  grades: Record<string, string>;
  sgpa: number;
  cgpa: number;
  result: string;
  failedSubjectsCount: number;
}

export interface AnalysisData {
  summary: {
    totalAppeared: number;
    totalPass: number;
    totalPromoted: number;
    totalFail: number;
    passPercentage: string;
    promotedPercentage: string;
    classDistribution: { distinction: number; firstClass: number; secondClass: number; };
    failureDistribution: { '1': number; '2': number; '3': number; '>3': number; };
  };
  subjectWiseAnalysis: SubjectAnalysis[];
  students: StudentResult[];
  insights: {
    topSubjects: SubjectAnalysis[];
    weakSubjects: SubjectAnalysis[];
    toppers: StudentResult[];
    atRisk: StudentResult[];
    suggestions: string[];
  };
}
