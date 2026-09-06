// import fs from "node:fs";
// import path from "node:path";

// const root = process.cwd();

// const outputPath = path.join(
//   root,
//   "packages",
//   "shared",
//   "src",
//   "data",
//   "mockData.ts"
// );

// const firstNames = [
//   "محمد",
//   "أحمد",
//   "عمر",
//   "عبدالله",
//   "يوسف",
//   "خالد",
//   "سليم",
//   "ياسين",
//   "إبراهيم",
//   "معاذ",
//   "رامي",
//   "أنس",
//   "حسن",
//   "محمود",
//   "طارق",
//   "سعيد",
//   "زياد",
//   "أيمن",
//   "باسل",
//   "كريم",
// ];

// const lastNames = [
//   "العلي",
//   "الحسن",
//   "الخطيب",
//   "الحموي",
//   "النعسان",
//   "الدرويش",
//   "السالم",
//   "الحداد",
//   "النجار",
//   "الرفاعي",
//   "الشيخ",
//   "الحمود",
//   "العباس",
//   "الزعبي",
//   "الطويل",
//   "الموسى",
//   "اليوسف",
//   "الظاهر",
//   "القاسم",
//   "الصالح",
// ];

// const schoolDefinitions = [
//   {
//     id: "school-1",
//     name: "مدارس الغسانية - القسم الأول",
//     location: "الموقع الأول",
//     status: "active",
//     admins: 2,
//   },
//   {
//     id: "school-2",
//     name: "مدارس الغسانية - القسم الثاني",
//     location: "الموقع الثاني",
//     status: "active",
//     admins: 2,
//   },
//   {
//     id: "school-3",
//     name: "مدارس الغسانية - القسم الثالث",
//     location: "الموقع الثالث",
//     status: "active",
//     admins: 1,
//   },
// ];

// const grades = [
//   { id: "grade-1", name: "الصف الأول" },
//   { id: "grade-2", name: "الصف الثاني" },
//   { id: "grade-3", name: "الصف الثالث" },
//   { id: "grade-4", name: "الصف الرابع" },
//   { id: "grade-5", name: "الصف الخامس" },
//   { id: "grade-6", name: "الصف السادس" },
// ];

// const subjects = [
//   { id: "subject-1", name: "اللغة العربية" },
//   { id: "subject-2", name: "الرياضيات" },
//   { id: "subject-3", name: "العلوم" },
//   { id: "subject-4", name: "اللغة الإنجليزية" },
// ];

// const violationTypes = [
//   {
//     id: "violation-1",
//     name: "تأخر عن الدوام",
//     points: -10,
//   },
//   {
//     id: "violation-2",
//     name: "غياب بدون عذر",
//     points: -15,
//   },
//   {
//     id: "violation-3",
//     name: "سلوك غير منضبط",
//     points: -20,
//   },
//   {
//     id: "violation-4",
//     name: "مخالفة جسيمة",
//     points: -30,
//   },
// ];

// const sections = [];
// const guardians = [];
// const students = [];
// const violations = [];

// let studentCounter = 1;
// let guardianCounter = 1;
// let violationCounter = 1;

// const studentsPerSchool = 20;

// // إنشاء الشعب
// for (const school of schoolDefinitions) {
//   for (const grade of grades) {
//     for (let sectionNumber = 1; sectionNumber <= 2; sectionNumber++) {
//       sections.push({
//         id: `${school.id}-${grade.id}-section-${sectionNumber}`,
//         name:` الشعبة ${sectionNumber}`,
//         gradeId: grade.id,
//         schoolId: school.id,
//       });
//     }
//   }
// }

// // 60 طالبًا
// for (const school of schoolDefinitions) {
//   for (let i = 0; i < studentsPerSchool; i++) {
//     const firstName = firstNames[(studentCounter - 1) % firstNames.length];
//     const lastName =
//       lastNames[Math.floor((studentCounter - 1) / firstNames.length) % lastNames.length];

//     const grade = grades[i % grades.length];

//     const schoolSections = sections.filter(
//       (section) =>
//         section.schoolId === school.id &&
//         section.gradeId === grade.id
//     );

//     const section = schoolSections[i % schoolSections.length];

//     const guardian = {
//       id: `guardian-${guardianCounter}`,
//       name: `${lastName} ${firstName}`,
//       phone: `09${String(10000000 + guardianCounter).slice(-8)}`,
//       relation: "ولي أمر",
//     };

//     guardians.push(guardian);

//     students.push({
//       id: `student-${studentCounter}`,
//       firstName,
//       lastName,
//       fullName: `${firstName} ${lastName}`,
//       schoolId: school.id,
//       gradeId: grade.id,
//       sectionId: section.id,
//       guardianId: guardian.id,
//       totalPoints: 0,
//       requiresGuardianCall: false,
//     });

//     guardianCounter++;
//     studentCounter++;
//   }
// }

// // إنشاء المخالفات
// for (const student of students) {
//   const studentNumber = Number(student.id.replace("student-", ""));

//   /*
//    * الطلاب من 1 إلى 15:
//    * 4 مخالفات = -30 -30 -30 -20 = -110
//    * وبالتالي يجب استدعاء ولي الأمر.
//    *
//    * بقية الطلاب:
//    * 3 مخالفات كحد أقصى = -90
//    * وبالتالي لن يتجاوزوا حد -100.
//    */

//   const shouldRequireGuardianCall = studentNumber <= 15;

//   const violationIds = shouldRequireGuardianCall
//     ? [3, 3, 3, 2]
//     : [
//         ((studentNumber + 0) % 4) + 1,
//         ((studentNumber + 1) % 4) + 1,
//         ((studentNumber + 2) % 4) + 1,
//       ];

//   for (const violationTypeNumber of violationIds) {
//     const violationType =
//       violationTypes[violationTypeNumber - 1];

//     violations.push({
//       id: `violation-${violationCounter}`,
//       studentId: student.id,
//       schoolId: student.schoolId,
//       violationTypeId: violationType.id,
//       points: violationType.points,
//       date: `2026-08-${String((violationCounter % 28) + 1).padStart(2, "0")}`,
//     });

//     student.totalPoints += violationType.points;

//     violationCounter++;
//   }

//   student.requiresGuardianCall =
//     student.totalPoints < -100;
// }

// // إحصائيات المدارس
// const schools = schoolDefinitions.map((school) => {
//   const schoolStudents = students.filter(
//     (student) => student.schoolId === school.id
//   );

//   const schoolViolations = violations.filter(
//     (violation) => violation.schoolId === school.id
//   );

//   return {
//     ...school,
//     students: schoolStudents.length,
//     violations: schoolViolations.length,
//   };
// });

// const fileContent = `
// // THIS FILE IS GENERATED AUTOMATICALLY.
// // DO NOT EDIT THIS FILE MANUALLY.

// export type SchoolStatus = "active" | "inactive";

// export type School = {
//   id: string;
//   name: string;
//   location: string;
//   status: SchoolStatus;
//   students: number;
//   violations: number;
//   admins: number;
// };

// export type Grade = {
//   id: string;
//   name: string;
// };

// export type Section = {
//   id: string;
//   name: string;
//   gradeId: string;
//   schoolId: string;
// };

// export type Subject = {
//   id: string;
//   name: string;
// };

// export type ViolationType = {
//   id: string;
//   name: string;
//   points: number;
// };

// export type Guardian = {
//   id: string;
//   name: string;
//   phone: string;
//   relation: string;
// };

// export type Student = {
//   id: string;
//   firstName: string;
//   lastName: string;
//   fullName: string;
//   schoolId: string;
//   gradeId: string;
//   sectionId: string;
//   guardianId: string;
//   totalPoints: number;
//   requiresGuardianCall: boolean;
// };

// export type Violation = {
//   id: string;
//   studentId: string;
//   schoolId: string;
//   violationTypeId: string;
//   points: number;
//   date: string;
// };

// export const schools: School[] = ${JSON.stringify(schools, null, 2)};

// export const grades: Grade[] = ${JSON.stringify(grades, null, 2)};

// export const sections: Section[] = ${JSON.stringify(sections, null, 2)};

// export const subjects: Subject[] = ${JSON.stringify(subjects, null, 2)};

// export const violationTypes: ViolationType[] = ${JSON.stringify(
//   violationTypes,
//   null,
//   2
// )};

// export const guardians: Guardian[] = ${JSON.stringify(
//   guardians,
//   null,
//   2
// )};

// export const students: Student[] = ${JSON.stringify(
//   students,
//   null,
//   2
// )};

// export const violations: Violation[] = ${JSON.stringify(
//   violations,
//   null,
//   2
// )};
// ;

// fs.mkdirSync(path.dirname(outputPath), {
//   recursive: true,
// });

// fs.writeFileSync(outputPath, fileContent.trimStart(), "utf8");

// console.log("Mock data generated successfully.");
// console.log(Students: ${students.length});
// console.log(Violations: ${violations.length});
// console.log(
//   Students requiring guardian call: ${
//     students.filter((student) => student.requiresGuardianCall).length
//   }
// );`