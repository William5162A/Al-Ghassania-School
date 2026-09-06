import * as XLSX from "xlsx";
import {
  schools,
  grades,
  sections,
  students,
  violations,
  violationTypes,
  guardianCalls,
  teachers,
  periods,
} from "@shared/data/mockData";

type ExportRow = {
  "اسم الطالب": string;
  "معرف الطالب": string;
  "المدرسة": string;
  "الصف": string;
  "الشعبة": string;
  "تاريخ المخالفة": string;
  "نوع المخالفة": string;
  "النقاط المخصومة": number;
  "الحصة": string;
  "المادة": string;
  "المعلم": string;
  "ملاحظات": string;
  "عدد استدعاءات ولي الأمر": number;
  "آخر استدعاء ولي أمر": string;
};

function sanitizeSheetName(name: string): string {
  const sanitized = name.replace(/[\\\/:*?"<>|]/g, "_").substring(0, 31);
  return sanitized || "Sheet";
}

function makeUniqueSheetName(baseName: string, existingNames: Set<string>): string {
  let name = sanitizeSheetName(baseName);
  let counter = 1;
  while (existingNames.has(name)) {
    name = sanitizeSheetName(`${baseName}_${counter}`);
    counter++;
  }
  existingNames.add(name);
  return name;
}

function getGuardianCallStats(studentId: string) {
  const calls = guardianCalls.filter((c) => c.studentId === studentId && c.status === "contacted");
  const count = calls.length;
  const latestDate = count > 0
    ? calls.reduce((latest, c) => new Date(c.date) > new Date(latest.date) ? c : latest).date
    : "";
  return { count, latestDate };
}

function getTeacherName(teacherId: string): string {
  const teacher = teachers.find((t) => t.id === teacherId);
  return teacher?.name ?? "";
}

function getPeriodName(periodId: string): string {
  const period = periods.find((p) => p.id === periodId);
  return period?.name ?? "";
}

function getSchoolName(schoolId: string): string {
  const school = schools.find((s) => s.id === schoolId);
  return school?.name ?? "";
}

function getGradeName(gradeId: string): string {
  const grade = grades.find((g) => g.id === gradeId);
  return grade?.name ?? "";
}

function getSectionName(sectionId: string): string {
  const section = sections.find((s) => s.id === sectionId);
  return section?.name ?? "";
}

function getViolationTypeName(typeId: string): string {
  const type = violationTypes.find((t) => t.id === typeId);
  return type?.name ?? "";
}

function buildExportRows(
  filteredViolations: typeof violations,
  _filteredStudents: typeof students,
  _studentPointsMap: Map<string, number>,
  schoolFilter: string | null
): ExportRow[] {
  const rows: ExportRow[] = [];

  for (const violation of filteredViolations) {
    const student = students.find((s) => s.id === violation.studentId);
    if (!student) continue;

    if (schoolFilter && student.schoolId !== schoolFilter) continue;

    const gradeName = getGradeName(student.gradeId);
    const sectionName = getSectionName(student.sectionId);
    const schoolName = getSchoolName(student.schoolId);
    const violationTypeName = getViolationTypeName(violation.violationTypeId);
    const periodName = getPeriodName(violation.periodId);
    const teacherName = getTeacherName(violation.teacherId);

    const guardianStats = getGuardianCallStats(student.id);

    rows.push({
      "اسم الطالب": student.fullName,
      "معرف الطالب": student.id,
      "المدرسة": schoolName,
      "الصف": gradeName,
      "الشعبة": sectionName,
      "تاريخ المخالفة": violation.date,
      "نوع المخالفة": violationTypeName,
      "النقاط المخصومة": Math.abs(violation.points),
      "الحصة": periodName,
      "المادة": "",
      "المعلم": teacherName,
      "ملاحظات": "",
      "عدد استدعاءات ولي الأمر": guardianStats.count,
      "آخر استدعاء ولي أمر": guardianStats.latestDate,
    });
  }

  return rows;
}

export function exportOwnerReport(
  schoolFilter: string,
  filteredViolations: typeof violations,
  filteredStudents: typeof students,
  studentPointsMap: Map<string, number>
): void {
  const workbook = XLSX.utils.book_new();
  const existingSheetNames = new Set<string>();

  const targetSchools = schoolFilter === "all"
    ? schools.filter((s) => s.status === "active")
    : schools.filter((s) => s.id === schoolFilter && s.status === "active");

  for (const school of targetSchools) {
    const schoolViolations = filteredViolations.filter((v) => v.schoolId === school.id);
    if (schoolViolations.length === 0) continue;

    const schoolStudents = filteredStudents.filter((s) => s.schoolId === school.id);
    const rows = buildExportRows(schoolViolations, schoolStudents, studentPointsMap, school.id);

    if (rows.length === 0) continue;

    const sheetName = makeUniqueSheetName(school.name, existingSheetNames);
    const worksheet = XLSX.utils.json_to_sheet(rows);

    const colWidths = [
      { wch: 25 }, // اسم الطالب
      { wch: 15 }, // معرف الطالب
      { wch: 25 }, // المدرسة
      { wch: 15 }, // الصف
      { wch: 15 }, // الشعبة
      { wch: 15 }, // تاريخ المخالفة
      { wch: 20 }, // نوع المخالفة
      { wch: 15 }, // النقاط المخصومة
      { wch: 15 }, // الحصة
      { wch: 15 }, // المادة
      { wch: 20 }, // المعلم
      { wch: 20 }, // ملاحظات
      { wch: 20 }, // عدد استدعاءات ولي الأمر
      { wch: 15 }, // آخر استدعاء ولي أمر
    ];
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  if (workbook.SheetNames.length === 0) {
    const emptySheet = XLSX.utils.json_to_sheet([]);
    const headerRow = [
      "اسم الطالب", "معرف الطالب", "المدرسة", "الصف", "الشعبة",
      "تاريخ المخالفة", "نوع المخالفة", "النقاط المخصومة", "الحصة",
      "المادة", "المعلم", "ملاحظات", "عدد استدعاءات ولي الأمر", "آخر استدعاء ولي أمر"
    ];
    XLSX.utils.sheet_add_aoa(emptySheet, [headerRow], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, emptySheet, "تقرير");
  }

  const fileName = schoolFilter === "all"
    ? "AlGhassania_All_Schools.xlsx"
    : `AlGhassania_${schools.find(s => s.id === schoolFilter)?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_") || "School"}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}

export function exportAdminReport(
  schoolId: string,
  filteredViolations: typeof violations,
  filteredStudents: typeof students,
  studentPointsMap: Map<string, number>
): void {
  const workbook = XLSX.utils.book_new();
  const existingSheetNames = new Set<string>();

  const school = schools.find((s) => s.id === schoolId);
  if (!school) return;

  const rows = buildExportRows(filteredViolations, filteredStudents, studentPointsMap, schoolId);

  if (rows.length === 0) {
    const emptySheet = XLSX.utils.json_to_sheet([]);
    const headerRow = [
      "اسم الطالب", "معرف الطالب", "المدرسة", "الصف", "الشعبة",
      "تاريخ المخالفة", "نوع المخالفة", "النقاط المخصومة", "الحصة",
      "المادة", "المعلم", "ملاحظات", "عدد استدعاءات ولي الأمر", "آخر استدعاء ولي أمر"
    ];
    XLSX.utils.sheet_add_aoa(emptySheet, [headerRow], { origin: "A1" });
    XLSX.utils.book_append_sheet(workbook, emptySheet, "تقرير");
  } else {
    const sheetName = makeUniqueSheetName(school.name, existingSheetNames);
    const worksheet = XLSX.utils.json_to_sheet(rows);

    const colWidths = [
      { wch: 25 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
    ];
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const safeSchoolName = school.name.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_");
  const fileName = `AlGhassania_${safeSchoolName}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}