import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as XLSX from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// --- RESULT ANALYSIS ENGINE ---

const SUBJECT_MAPPING = {
  "BTE21001": "Engineering Mathematics-1",
  "BTE22010": "Engineering Physics",
  "BTE21405": "Software Foundation and Programming with C++",
  "BTE22265": "BBE",
  "BTE23018": "Biology for Engineers",
  "BTE21427": "Computer Aided Engineering Graphics",
  "BTE21428": "Sports and Yoga / NSS / NCC",
  "BTE22014": "Engineering Physics Laboratory",
  "BTE22266": "BBE Laboratory",
  "BTE21406": "Software Foundation and Programming (C++) Laboratory",
  "BTE21429": "CAEG Laboratory"
};

function getMappedSubject(code) {
  const normalizedCode = code.replace(/\s+/g, '').toUpperCase();
  if (SUBJECT_MAPPING[normalizedCode]) {
    return `${SUBJECT_MAPPING[normalizedCode]} (${normalizedCode})`;
  }
  console.warn(`Warning: Subject code not found in mapping: ${code}`);
  return code;
}

function parseGradesFromHeaderAndCell(headerStr, cellStr) {
  // Example header: "BTE21001\r\nBTE22266" or "BTE21001 BTE22266"
  // Example cell: "B/B+" or "A+/A"
  const subjects = headerStr.split(/[\r\n/]+/).map(s => s.trim()).filter(Boolean);
  const grades = String(cellStr).split('/').map(s => s.trim());
  
  const mappedGrades = {};
  for (let i = 0; i < subjects.length; i++) {
    const subjectName = getMappedSubject(subjects[i]);
    mappedGrades[subjectName] = grades[i] || grades[0] || 'N/A'; // fallback if only one grade is provided
  }
  return mappedGrades;
}

function processExcelData(jsonData) {
  if (!jsonData || jsonData.length === 0) return null;

  // Find the actual header row
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
    const values = Object.values(jsonData[i]).map(v => String(v).toLowerCase());
    if (values.some(v => v.includes('enrollment') || v.includes('student'))) {
      headerRowIndex = i;
      break;
    }
  }

  let headers = {};
  let dataRows = jsonData;

  if (headerRowIndex !== -1) {
    headers = jsonData[headerRowIndex];
    dataRows = jsonData.slice(headerRowIndex + 1);
  } else {
    // If no header found in rows, assume it's correctly mapped by sheet_to_json
    headers = Object.keys(jsonData[0]).reduce((acc, k) => ({ ...acc, [k]: k }), {});
  }

  // Identify core columns
  let enrollmentKey, nameKey, sgpaKey, cgpaKey, resultKey;
  const subjectKeys = [];

  for (const [rawKey, rawVal] of Object.entries(headers)) {
    const val = String(rawVal).toLowerCase();
    if (val.includes('enrollment')) enrollmentKey = rawKey;
    else if (val.includes('student') || val.includes('name')) nameKey = rawKey;
    else if (val.includes('sgpa')) sgpaKey = rawKey;
    else if (val.includes('cgpa')) cgpaKey = rawKey;
    else if (val.includes('result')) resultKey = rawKey;
    else if (!val.includes('sr') && !val.includes('no')) {
      // Treat other columns as subjects if they look like codes
      subjectKeys.push(rawKey);
    }
  }

  const students = [];
  const subjectStats = {};

  let totalPass = 0;
  let totalPromoted = 0;
  let totalFail = 0;

  let distinction = 0;
  let firstClass = 0;
  let secondClass = 0;
  
  const failureDist = { 1: 0, 2: 0, 3: 0, '>3': 0 };

  dataRows.forEach(row => {
    if (!row[enrollmentKey]) return; // Skip empty rows

    const enrollmentNo = String(row[enrollmentKey] || '');
    const name = String(row[nameKey] || '');
    const sgpa = parseFloat(row[sgpaKey]) || 0;
    const cgpa = parseFloat(row[cgpaKey]) || 0;
    const result = String(row[resultKey] || '').toUpperCase();

    const grades = {};
    let failedSubjectsCount = 0;

    for (const subKey of subjectKeys) {
      const headerStr = String(headers[subKey]);
      const cellStr = row[subKey];
      if (cellStr === undefined) continue;

      const parsedGrades = parseGradesFromHeaderAndCell(headerStr, cellStr);
      
      for (const [subjectCode, grade] of Object.entries(parsedGrades)) {
        grades[subjectCode] = grade;
        
        if (!subjectStats[subjectCode]) {
          subjectStats[subjectCode] = { appeared: 0, passed: 0, gradeDistribution: {} };
        }
        
        subjectStats[subjectCode].appeared++;
        if (grade !== 'F' && grade !== 'Fail' && grade !== 'Ab') {
          subjectStats[subjectCode].passed++;
        } else {
          failedSubjectsCount++;
        }

        // Track Grade Distribution
        const normalizedGrade = String(grade).toUpperCase().trim();
        if (normalizedGrade && normalizedGrade !== 'N/A' && normalizedGrade !== 'AB') {
          if (!subjectStats[subjectCode].gradeDistribution[normalizedGrade]) {
             subjectStats[subjectCode].gradeDistribution[normalizedGrade] = 0;
          }
          subjectStats[subjectCode].gradeDistribution[normalizedGrade]++;
        }
      }
    }

    students.push({
      enrollmentNo,
      name,
      grades,
      sgpa,
      cgpa,
      result,
      failedSubjectsCount
    });

    if (result.includes('PASS')) totalPass++;
    else if (result.includes('PROMOTED')) totalPromoted++;
    else if (result.includes('FAIL')) totalFail++;

    // Calculate class distribution based on CGPA roughly (Assuming 10 point scale)
    // Percentage ≈ CGPA * 10
    const percentage = cgpa * 10;
    if (result.includes('PASS')) {
      if (percentage >= 80) distinction++;
      else if (percentage >= 60) firstClass++;
      else if (percentage >= 40) secondClass++;
    }

    if (failedSubjectsCount === 1) failureDist['1']++;
    else if (failedSubjectsCount === 2) failureDist['2']++;
    else if (failedSubjectsCount === 3) failureDist['3']++;
    else if (failedSubjectsCount > 3) failureDist['>3']++;
  });

  const totalAppeared = students.length;
  
  const summary = {
    totalAppeared,
    totalPass,
    totalPromoted,
    totalFail,
    passPercentage: totalAppeared ? ((totalPass / totalAppeared) * 100).toFixed(2) : 0,
    promotedPercentage: totalAppeared ? ((totalPromoted / totalAppeared) * 100).toFixed(2) : 0,
    classDistribution: { distinction, firstClass, secondClass },
    failureDistribution: failureDist
  };

  const subjectWiseAnalysis = Object.entries(subjectStats).map(([code, stats]) => {
    const isLab = code.toLowerCase().includes('laboratory');
    return {
      subjectCode: code,
      type: isLab ? 'PR' : 'TH',
      appeared: stats.appeared,
      passed: stats.passed,
      passingPercentage: stats.appeared ? ((stats.passed / stats.appeared) * 100).toFixed(2) : 0,
      gradeDistribution: stats.gradeDistribution
    };
  });

  // AI Insights Generation
  const sortedSubjects = [...subjectWiseAnalysis].sort((a, b) => parseFloat(b.passingPercentage) - parseFloat(a.passingPercentage));
  const topSubjects = sortedSubjects.slice(0, 3);
  const weakSubjects = sortedSubjects.slice(-3).reverse();
  const toppers = [...students].sort((a, b) => b.sgpa - a.sgpa).slice(0, 5);
  const atRisk = students.filter(s => s.failedSubjectsCount >= 3);

  const suggestions = [];
  if (weakSubjects.length > 0) {
    suggestions.push(`Focus on improving passing rates in ${weakSubjects.map(s => s.subjectCode).join(', ')}.`);
  }
  if (topSubjects.length > 0) {
    suggestions.push(`Excellent performance observed in ${topSubjects[0].subjectCode} (${topSubjects[0].passingPercentage}% pass rate).`);
  }

  const insights = {
    topSubjects,
    weakSubjects,
    toppers,
    atRisk,
    suggestions
  };

  return {
    summary,
    subjectWiseAnalysis,
    students,
    insights
  };
}

// Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      console.warn('Upload request received with no file');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, size } = req.file;
    const extension = path.extname(originalname).toLowerCase();
    console.log('Upload request received:', { originalname, mimetype, size, extension });

    if (!['.xlsx', '.xls', '.csv'].includes(extension)) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload an Excel or CSV file.' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // Read with defval to avoid dropping empty columns
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    console.log('Parsed sheet data rows:', jsonData.length, 'sheetName:', sheetName);
    const analysis = processExcelData(jsonData);

    if (!analysis) {
      console.warn('Upload processing returned no analysis for file:', originalname);
      return res.status(400).json({ error: 'Failed to process file data' });
    }

    console.log('File analysis completed:', { originalname, totalAppeared: analysis.summary.totalAppeared, totalPass: analysis.summary.totalPass });
    res.json(analysis);
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : error);
    res.status(500).json({ error: 'Internal server error processing file' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
