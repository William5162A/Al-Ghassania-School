import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const outputPath = path.join(
  root,
  "packages",
  "shared",
  "src",
  "data",
  "mockData.ts"
);

// ============================================================
// Centralized Constants
// ============================================================

export const GUARDIAN_CALL_THRESHOLD = -100;

// ============================================================
// Names
// ============================================================

const firstNames = [
  "محمد", "أحمد", "عمر", "عبدالله", "يوسف", "خالد", "سليم", "ياسين",
  "إبراهيم", "معاذ", "رامي", "أنس", "حسن", "محمود", "طارق", "سعيد",
  "زياد", "أيمن", "باسل", "كريم",
];

const lastNames = [
  "العلي", "الحسن", "الخطيب", "الحموي", "النعسان", "الدرويش", "السالم",
  "الحداد", "النجار", "الرفاعي", "الشيخ", "الحمود", "العباس", "الزعبي",
  "الطويل", "الموسى", "اليوسف", "الظاهر", "القاسم", "الصالح",
];

// ============================================================
// Schools
// ============================================================

const schoolDefinitions = [
  { id: "school-1", name: "مدارس الغسانية - المدرسة الأولى", location: "الموقع الأول", status: "active", admins: 1, type: "basic" },
  { id: "school-2", name: "مدارس الغسانية - المدرسة الثانية", location: "الموقع الثاني", status: "active", admins: 1, type: "basic" },
  { id: "school-3", name: "مدارس الغسانية - المدرسة الثالثة", location: "الموقع الثالث", status: "active", admins: 1, type: "basic" },
  { id: "school-4", name: "مدارس الغسانية - المدرسة الرابعة", location: "الموقع الرابع", status: "active", admins: 1, type: "basic" },
  { id: "school-5", name: "مدارس الغسانية - المدرسة الثانوية والإعدادية", location: "الموقع الخامس", status: "active", admins: 1, type: "secondary" },
];

// ============================================================
// Academic Years
// ============================================================

const academicYears = [
  { id: "ay-2024-2025", name: "2024/2025", label: "2024/2025", status: "closed", startDate: "2024-09-01", endDate: "2025-06-30" },
  { id: "ay-2025-2026", name: "2025/2026", label: "2025/2026", status: "current", startDate: "2025-09-01", endDate: "2026-06-30" },
];

const CURRENT_ACADEMIC_YEAR_ID = "ay-2025-2026";

// ============================================================
// Classes (separate from Grade concept)
// ============================================================

const classDefinitions = [
  { id: "class-4", name: "الصف الرابع", level: 4, category: "basic" },
  { id: "class-5", name: "الصف الخامس", level: 5, category: "basic" },
  { id: "class-6", name: "الصف السادس", level: 6, category: "basic" },
  { id: "class-7", name: "الصف السابع", level: 7, category: "secondary" },
  { id: "class-8", name: "الصف الثامن", level: 8, category: "secondary" },
  { id: "class-9", name: "الصف التاسع", level: 9, category: "secondary" },
  { id: "class-10", name: "الصف العاشر", level: 10, category: "secondary" },
  { id: "class-11", name: "الصف الحادي عشر", level: 11, category: "secondary" },
  { id: "class-12", name: "البكلوريا (الثاني عشر)", level: 12, category: "secondary" },
];

function getClassesForSchoolType(schoolType) {
  return classDefinitions.filter(c => c.category === schoolType);
}

// ============================================================
// Grades (kept for backward compatibility)
// ============================================================

const grades = classDefinitions.map(c => ({ id: c.id, name: c.name }));

// ============================================================
// Subjects
// ============================================================

const subjects = [
  { id: "subject-1", name: "اللغة العربية" },
  { id: "subject-2", name: "الرياضيات" },
  { id: "subject-3", name: "العلوم" },
  { id: "subject-4", name: "اللغة الإنجليزية" },
  { id: "subject-5", name: "التربية الإسلامية" },
  { id: "subject-6", name: "الدراسات الاجتماعية" },
];

// ============================================================
// Violation Types
// ============================================================

const violationTypes = [
  { id: "violation-1", name: "تأخر عن الدوام", points: -10 },
  { id: "violation-2", name: "غياب بدون عذر", points: -15 },
  { id: "violation-3", name: "سلوك غير منضبط", points: -20 },
  { id: "violation-4", name: "مخالفة جسيمة", points: -30 },
];

// ============================================================
// Periods
// ============================================================

const periods = [
  { id: "period-1", name: "الحصة الأولى", startTime: "08:00", endTime: "08:50" },
  { id: "period-2", name: "الحصة الثانية", startTime: "08:50", endTime: "09:40" },
  { id: "period-3", name: "الحصة الثالثة", startTime: "10:00", endTime: "10:50" },
  { id: "period-4", name: "الحصة الرابعة", startTime: "10:50", endTime: "11:40" },
  { id: "period-5", name: "الحصة الخامسة", startTime: "12:00", endTime: "12:50" },
  { id: "period-6", name: "الحصة السادسة", startTime: "12:50", endTime: "13:40" },
  { id: "period-7", name: "الحصة السابعة", startTime: "13:50", endTime: "14:40" },
  { id: "period-8", name: "الحصة الثامنة", startTime: "14:40", endTime: "15:30" },
];

// ============================================================
// Teacher Names
// ============================================================

const teacherFirstNames = [
  "أحمد", "خالد", "محمد", "سامر", "يزن", "هيثم", "باسل", "رامي",
  "فادي", "عصام", "مازن", "نضال", "جهاد", "عماد", "رياض",
];

const teacherLastNames = [
  "الخطيب", "الحموي", "النعسان", "الدرويش", "السالم",
  "الحداد", "النجار", "الرفاعي", "الشيخ", "الحمود",
  "العباس", "الزعبي", "الطويل", "الموسى", "اليوسف",
  "الظاهر", "القاسم", "الصالح",
];

// ============================================================
// Storage Arrays
// ============================================================

const sections = [];
const teachers = [];
const guardianCalls = [];
const guardians = [];
const students = [];
const violations = [];
const enrollments = [];
const teacherAssignments = [];

let studentCounter = 1;
let guardianCounter = 1;
let violationCounter = 1;
let teacherCounter = 1;
let guardianCallCounter = 1;
let enrollmentCounter = 1;
let assignmentCounter = 1;

// ============================================================
// Student Distribution Per School
// ============================================================

const studentsPerSchool = {
  "school-1": 240,
  "school-2": 240,
  "school-3": 240,
  "school-4": 240,
  "school-5": 340,
};

function calculateStudentsPerGrade(school) {
  const schoolStudentCount = studentsPerSchool[school.id];
  const schoolClasses = getClassesForSchoolType(school.type);
  const studentsPerClass = Math.floor(studentsPerSchool[school.id] / schoolClasses.length);
  let remainingStudents = studentsPerSchool[school.id] % schoolClasses.length;
  const result = {};
  for (const cls of schoolClasses) {
    let classStudentCount = studentsPerClass;
    if (remainingStudents > 0) { classStudentCount++; remainingStudents--; }
    result[cls.id] = classStudentCount;
  }
  return result;
}

// ============================================================
// Create Sections (linked to AcademicYear, Class, School)
// ============================================================

console.log("Creating sections...");

for (const school of schoolDefinitions) {
  const schoolClasses = getClassesForSchoolType(school.type);
  const gradeCounts = calculateStudentsPerGrade(school);

  for (const cls of schoolClasses) {
    // EVERY CLASS = EXACTLY 3 SECTIONS per academic year
    const sectionCount = 3;

    for (let sectionNumber = 1; sectionNumber <= sectionCount; sectionNumber++) {
      for (const ay of academicYears) {
        sections.push({
          id: `${school.id}-${cls.id}-${ay.id}-section-${sectionNumber}`,
          name: `الشعبة ${sectionNumber}`,
          classId: cls.id,
          schoolId: school.id,
          academicYearId: ay.id,
          // Backward compatibility
          gradeId: cls.id,
        });
      }
    }
  }
}

// ============================================================
// Create Teachers (one per subject per school)
// ============================================================

console.log("Creating teachers...");

for (const school of schoolDefinitions) {
  for (const subject of subjects) {
    const firstName = teacherFirstNames[(teacherCounter - 1) % teacherFirstNames.length];
    const lastName = teacherLastNames[
      Math.floor((teacherCounter - 1) / teacherFirstNames.length) % teacherLastNames.length
    ];

    teachers.push({
      id: `teacher-${teacherCounter}`,
      name: `${firstName} ${lastName}`,
      schoolId: school.id,
      subjectId: subject.id,
    });

    teacherCounter++;
}
}

// ============================================================
// Create Teacher-Subject-Section Assignments
// ============================================================

console.log("Creating teacher assignments...");

for (const school of schoolDefinitions) {
  const schoolTeachers = teachers.filter(t => t.schoolId === school.id);
  const schoolSections = sections.filter(s => s.schoolId === school.id);

  for (const section of schoolSections) {
    for (const subject of subjects) {
      const teacher = schoolTeachers.find(t => t.subjectId === subject.id);
      if (teacher) {
        teacherAssignments.push({
          id: `assignment-${assignmentCounter++}`,
          teacherId: teacher.id,
          subjectId: subject.id,
          sectionId: section.id,
          schoolId: school.id,
          academicYearId: section.academicYearId,
        });
      }
    }
  }
}

// ============================================================
// Create Students (linked to enrollments)
// ============================================================

console.log("Creating students and enrollments...");

for (const school of schoolDefinitions) {
  const schoolStudentCount = studentsPerSchool[school.id];
  const schoolClasses = getClassesForSchoolType(school.type);

  const currentYearSections = sections.filter(
    s => s.schoolId === school.id && s.academicYearId === CURRENT_ACADEMIC_YEAR_ID
  );

  const classSectionCounters = {};
  for (const cls of getClassesForSchoolType(school.type)) {
    classSectionCounters[cls.id] = 0;
  }

  for (let i = 0; i < studentsPerSchool[school.id]; i++) {
    const firstName = firstNames[(studentCounter - 1) % firstNames.length];
    const lastName = lastNames[
      Math.floor((studentCounter - 1) / firstNames.length) % lastNames.length
    ];

    const cls = getClassesForSchoolType(school.type)[i % getClassesForSchoolType(school.type).length];

    const classSections = currentYearSections.filter(s => s.classId === cls.id);

    const sectionIndex = classSectionCounters[cls.id] % classSections.length;
    const section = classSections[sectionIndex];
    classSectionCounters[cls.id]++;

    const guardian = {
      id: `guardian-${guardianCounter}`,
      name: `ولي أمر ${lastName}`,
      phone: `09${String(10000000 + guardianCounter).slice(-8)}`,
      relation: "ولي أمر",
    };
    guardians.push(guardian);
    guardianCounter++;

    const student = {
      id: `student-${studentCounter}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      schoolId: school.id,
      guardianId: guardian.id,
      // Backward compatibility fields
      gradeId: cls.id,
      sectionId: section.id,
      totalPoints: 0,
      requiresGuardianCall: false,
      guardianContacted: false,
    };
    students.push(student);
    studentCounter++;

    enrollments.push({
      id: `enrollment-${enrollmentCounter++}`,
      studentId: student.id,
      academicYearId: CURRENT_ACADEMIC_YEAR_ID,
      classId: cls.id,
      sectionId: section.id,
      schoolId: school.id,
      status: "active",
    });
  }
}

// ============================================================
// Create Violations
// ============================================================

console.log("Creating violations...");

for (const student of students) {
  const studentNumber = Number(student.id.replace("student-", ""));

  let violationIds;
  if (studentNumber <= 15) {
    violationIds = [4, 4, 4, 3];
  } else {
    const pattern = studentNumber % 3;
    if (pattern === 0) violationIds = [1, 2, 3];
    else if (pattern === 1) violationIds = [2, 3, 4];
    else violationIds = [1, 3, 4];
  }

  for (const violationTypeNumber of violationIds) {
    const violationType = violationTypes[violationTypeNumber - 1];
    const associatedSubject = subjects[(violationTypeNumber - 1) % subjects.length];

    const teacher = teachers.find(
      t => t.schoolId === student.schoolId && t.subjectId === associatedSubject.id
    );

    const period = periods[(violationCounter - 1) % periods.length];

    violations.push({
      id: `violation-${violationCounter}`,
      studentId: student.id,
      schoolId: student.schoolId,
      violationTypeId: violationType.id,
      points: violationType.points,
      teacherId: teacher?.id || "",
      periodId: period.id,
      date: `2026-08-${String(((violationCounter - 1) % 28) + 1).padStart(2, "0")}`,
    });

    violationCounter++;
  }
}

// ============================================================
// Create Guardian Calls (with cycle tracking)
// ============================================================

console.log("Creating guardian calls...");

for (const student of students) {
  const studentViolations = violations.filter(v => v.studentId === student.id);
  const totalPoints = studentViolations.reduce((sum, v) => sum + v.points, 0);
  
  if (totalPoints < GUARDIAN_CALL_THRESHOLD) {
    const isPending = (Number(student.id.replace("student-", "")) % 5) === 0;
    const status = isPending ? "pending" : "contacted";

    guardianCalls.push({
      id: `guardian-call-${guardianCallCounter}`,
      studentId: student.id,
      guardianId: student.guardianId,
      schoolId: student.schoolId,
      callNumber: 1,
      date: `2026-08-${String(((guardianCallCounter - 1) % 28) + 1).padStart(2, "0")}`,
      status,
      recordedBy: `admin-${student.schoolId}`,
    });
    guardianCallCounter++;
  }
}

// ============================================================
// Calculate School Statistics
// ============================================================

const schoolsWithStats = schoolDefinitions.map((school) => {
  const schoolStudents = students.filter(s => s.schoolId === school.id);
  const schoolViolations = violations.filter(v => v.schoolId === school.id);
  return {
    id: school.id,
    name: school.name,
    location: school.location,
    status: school.status,
    students: schoolStudents.length,
    violations: schoolViolations.length,
    admins: school.admins,
  };
})

// ============================================================
// Helper Functions (for generated file) - as a string
// ============================================================

const helperCode = `
// ============================================================
// Point Calculation Helpers (Centralized Source of Truth)
// ============================================================

/**
 * Calculate total points for a student from their violations.
 * This is the single source of truth for point calculation.
 */
export function calculateStudentPoints(studentId: string, violations: Violation[]): number {
  return violations
    .filter(v => v.studentId === studentId)
    .reduce((sum, v) => sum + v.points, 0);
}

/**
 * Calculate points since the latest guardian call (current cycle).
 * Returns the sum of violation points recorded AFTER the most recent guardian call.
 */
export function calculateCurrentCyclePoints(
  studentId: string,
  violations: Violation[],
  guardianCalls: GuardianCall[]
): number {
  const studentCalls = guardianCalls
    .filter(c => c.studentId === studentId && c.status === "contacted")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (studentCalls.length === 0) {
    return calculateStudentPoints(studentId, violations);
  }

  const latestCall = studentCalls[0];
  const latestCallDate = new Date(latestCall.date).getTime();

  return violations
    .filter(v => v.studentId === studentId && new Date(v.date).getTime() > latestCallDate)
    .reduce((sum, v) => sum + v.points, 0);
}

/**
 * Calculate total lifetime points (all violations).
 */
export function calculateTotalPoints(studentId: string, violations: Violation[]): number {
  return calculateStudentPoints(studentId, violations);
}

/**
 * Get the latest guardian call for a student.
 */
export function getLatestGuardianCall(studentId: string, guardianCalls: GuardianCall[]): GuardianCall | null {
  const studentCalls = guardianCalls
    .filter(c => c.studentId === studentId && c.status === "contacted")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return studentCalls[0] || null;
}

/**
 * Get all guardian calls for a student.
 */
export function getStudentGuardianCalls(studentId: string, guardianCalls: GuardianCall[]): GuardianCall[] {
  return guardianCalls
    .filter(c => c.studentId === studentId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Calculate guardian call count for a student.
 */
export function calculateGuardianCallCount(studentId: string, guardianCalls: GuardianCall[]): number {
  return guardianCalls.filter(c => c.studentId === studentId && c.status === "contacted").length;
}

/**
 * Determine if a guardian call is required based on current cycle points.
 */
export function isGuardianCallRequired(
  studentId: string,
  violations: Violation[],
  guardianCalls: GuardianCall[],
  threshold: number = GUARDIAN_CALL_THRESHOLD
): boolean {
  const currentCyclePoints = calculateCurrentCyclePoints(studentId, violations, guardianCalls);
  return currentCyclePoints <= threshold;
}

/**
 * Get the current call number (next call would be this + 1).
 */
export function getNextCallNumber(studentId: string, guardianCalls: GuardianCall[]): number {
  const contactedCalls = guardianCalls.filter(c => c.studentId === studentId && c.status === "contacted");
  return contactedCalls.length + 1;
}

// ============================================================
// Guardian Call Helpers
// ============================================================

/**
 * Record a new guardian call.
 * Returns the new GuardianCall record.
 */
export function recordGuardianCall(
  studentId: string,
  guardianId: string,
  schoolId: string,
  recordedBy: string,
  guardianCalls: GuardianCall[]
): GuardianCall {
  const nextCallNumber = getNextCallNumber(studentId, guardianCalls);
  
  const newCall = {
    id: \`guardian-call-\${Date.now()}-\${Math.random().toString(36).slice(2, 8)}\`,
    studentId,
    guardianId,
    schoolId,
    callNumber: nextCallNumber,
    date: new Date().toISOString().split("T")[0],
    status: "contacted" as GuardianCallStatus,
    recordedBy,
  };
  
  return newCall;
}
`;

// ============================================================
// Generate Final File Content
// ============================================================

const fileContent = `// THIS FILE IS GENERATED AUTOMATICALLY.
// DO NOT EDIT THIS FILE MANUALLY.

// ============================================================
// Centralized Constants
// ============================================================

export const GUARDIAN_CALL_THRESHOLD = -100;
export const CURRENT_ACADEMIC_YEAR_ID = "ay-2025-2026";

// ============================================================
// Types
// ============================================================

export type SchoolStatus = "active" | "inactive";
export type AcademicYearStatus = "current" | "closed" | "upcoming";
export type EnrollmentStatus = "active" | "transferred" | "graduated" | "withdrawn";
export type GuardianCallStatus = "contacted" | "pending";

export type School = {
  id: string;
  name: string;
  location: string;
  status: SchoolStatus;
  students: number;
  violations: number;
  admins: number;
};

export type AcademicYear = {
  id: string;
  name: string;
  label: string;
  status: AcademicYearStatus;
  startDate: string;
  endDate: string;
};

export type Class = {
  id: string;
  name: string;
  level: number;
  category: "basic" | "secondary";
};

export type Grade = {
  id: string;
  name: string;
};

export type Section = {
  id: string;
  name: string;
  classId: string;
  schoolId: string;
  academicYearId: string;
  // Backward compatibility
  gradeId: string;
};

export type Subject = {
  id: string;
  name: string;
};

export type ViolationType = {
  id: string;
  name: string;
  points: number;
};

export type Guardian = {
  id: string;
  name: string;
  phone: string;
  relation: string;
};

export type Teacher = {
  id: string;
  name: string;
  schoolId: string;
  subjectId: string;
};

export type Period = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
};

export type TeacherSubjectSectionAssignment = {
  id: string;
  teacherId: string;
  subjectId: string;
  sectionId: string;
  schoolId: string;
  academicYearId: string;
};

export type Enrollment = {
  id: string;
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  schoolId: string;
  status: "active" | "transferred" | "graduated" | "withdrawn";
};

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  schoolId: string;
  guardianId: string;
  // Backward compatibility (derived, not authoritative):
  gradeId: string;
  sectionId: string;
  totalPoints: number;
  requiresGuardianCall: boolean;
  guardianContacted: boolean;
};

export type Violation = {
  id: string;
  studentId: string;
  schoolId: string;
  violationTypeId: string;
  points: number;
  teacherId: string;
  periodId: string;
  date: string;
};

export type GuardianCall = {
  id: string;
  studentId: string;
  guardianId: string;
  schoolId: string;
  callNumber: number;
  date: string;
  status: "contacted" | "pending";
  recordedBy: string;
};

${helperCode}

// ============================================================
// Data Arrays
// ============================================================

export const schools: School[] = ${JSON.stringify(schoolDefinitions.map(s => ({
  id: s.id,
  name: s.name,
  location: s.location,
  status: s.status,
  students: students.filter(st => st.schoolId === s.id).length,
  violations: violations.filter(v => v.schoolId === s.id).length,
  admins: s.admins,
})), null, 2)};

export const academicYears: AcademicYear[] = ${JSON.stringify(academicYears, null, 2)};

export const classes: Class[] = ${JSON.stringify(classDefinitions, null, 2)};

export const grades: Grade[] = ${JSON.stringify(grades, null, 2)};

export const sections: Section[] = ${JSON.stringify(sections, null, 2)};

export const subjects: Subject[] = ${JSON.stringify(subjects, null, 2)};

export const violationTypes: ViolationType[] = ${JSON.stringify(violationTypes, null, 2)};

export const guardians: Guardian[] = ${JSON.stringify(guardians, null, 2)};

export const teachers: Teacher[] = ${JSON.stringify(teachers, null, 2)};

export const periods: Period[] = ${JSON.stringify(periods, null, 2)};

export const teacherAssignments: TeacherSubjectSectionAssignment[] = ${JSON.stringify(teacherAssignments, null, 2)};

export const enrollments: Enrollment[] = ${JSON.stringify(enrollments, null, 2)};

export const students: Student[] = ${JSON.stringify(students, null, 2)};

export const violations: Violation[] = ${JSON.stringify(violations, null, 2)};

export const guardianCalls: GuardianCall[] = ${JSON.stringify(guardianCalls, null, 2)};
`;

// ============================================================
// Write File
// ============================================================

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, fileContent.trimStart(), "utf8");

// ============================================================
// Execution Report
// ============================================================

const studentsRequiringGuardianCall = students.filter(s => {
  const studentViolations = violations.filter(v => v.studentId === s.id);
  const totalPoints = studentViolations.reduce((sum, v) => sum + v.points, 0);
  return totalPoints <= GUARDIAN_CALL_THRESHOLD;
}).length;

const studentsBySectionId = students.reduce((acc, student) => {
  const enrollment = enrollments.find(e => e.studentId === student.id && e.academicYearId === CURRENT_ACADEMIC_YEAR_ID);
  if (enrollment) {
    acc[enrollment.sectionId] = (acc[enrollment.sectionId] || 0) + 1;
  }
  return acc;
}, {});

const sectionStudentCounts = sections.map(section => studentsBySectionId[section.id] || 0);
const maxStudentsInSection = sectionStudentCounts.length ? Math.max(...sectionStudentCounts) : 0;
const emptySectionCount = sectionStudentCounts.filter(count => count === 0).length;

console.log("======================================");
console.log("Mock data generated successfully.");
console.log("======================================");
console.log(`Schools: ${schoolDefinitions.length}`);
console.log(`Academic Years: ${academicYears.length}`);
console.log(`Classes: ${classDefinitions.length}`);
console.log(`Sections: ${sections.length}`);
console.log(`Students: ${students.length}`);
console.log(`Enrollments: ${enrollments.length}`);
console.log(`Guardians: ${guardians.length}`);
console.log(`Teachers: ${teachers.length}`);
console.log(`Teacher Assignments: ${teacherAssignments.length}`);
console.log(`Periods: ${periods.length}`);
console.log(`Guardian calls: ${guardianCalls.length}`);
console.log(`Violations: ${violations.length}`);
console.log(`Max students in any section: ${maxStudentsInSection}`);
console.log(`Empty sections: ${emptySectionCount}`);
console.log(`Students requiring guardian call: ${studentsRequiringGuardianCall}`);
console.log(`Output: ${outputPath}`);
console.log("======================================");
