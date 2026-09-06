const m = await import("../packages/shared/src/data/mockData.ts");
const { sections, students, enrollments } = m;
console.log("Total sections:", sections.length);
console.log("Total students:", students.length);
console.log("Total enrollments:", enrollments.length);

const byYear = {};
for (const s of sections) byYear[s.academicYearId] = (byYear[s.academicYearId] || 0) + 1;
console.log("Sections by academicYearId:", byYear);

console.log("\nschool-1 class-4 sections:");
for (const s of sections.filter(s => s.schoolId === "school-1" && s.classId === "class-4"))
  console.log(" ", s.id, "| name:", s.name, "| year:", s.academicYearId, "| gradeId:", s.gradeId);

const sectionById = new Map(sections.map(s => [s.id, s]));
const yearOfStudentSection = {};
let missing = 0;
for (const st of students) {
  const sec = sectionById.get(st.sectionId);
  if (!sec) { missing++; continue; }
  yearOfStudentSection[sec.academicYearId] = (yearOfStudentSection[sec.academicYearId] || 0) + 1;
}
console.log("\nStudents by academicYearId of their sectionId:", yearOfStudentSection, "| missing:", missing);

const enrYear = {};
for (const e of enrollments) enrYear[e.academicYearId] = (enrYear[e.academicYearId] || 0) + 1;
console.log("Enrollments by year:", enrYear);

const count = {};
for (const st of students.filter(s => s.schoolId === "school-1" && s.gradeId === "class-4"))
  count[st.sectionId] = (count[st.sectionId] || 0) + 1;
console.log("\nschool-1 class-4 student counts by sectionId:", count);

// Check duplicate section names+class within current year for school-1
const cur = sections.filter(s => s.schoolId === "school-1" && s.academicYearId === "ay-2025-2026" && s.classId === "class-4");
console.log("current-year school-1 class-4 section count:", cur.length);
