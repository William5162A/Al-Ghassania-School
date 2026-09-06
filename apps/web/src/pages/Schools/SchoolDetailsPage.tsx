import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  schools,
  students,
  grades,
  sections,
  violations,
  enrollments,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";

type GradeOverview = {
  id: string;
  name: string;
  sectionCount: number;
  studentCount: number;
  violationCount: number;
};

type SectionOverview = {
  id: string;
  name: string;
  studentCount: number;
  violationCount: number;
};

export function SchoolDetailsPage() {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  const school = schools.find((item) => item.id === schoolId);

  const gradeOverviews = useMemo<GradeOverview[]>(() => {
    const schoolStudents = students.filter(
      (student) => student.schoolId === schoolId
    );

    const schoolSections = sections.filter(
      (section) => section.schoolId === schoolId
    );

    const gradeIds = new Set(
      schoolStudents.map((student) => student.gradeId)
    );

return Array.from(gradeIds)
          .map((gradeId) => {
            const grade = grades.find((item) => item.id === gradeId);

            const gradeStudents = schoolStudents.filter(
              (student) => student.gradeId === gradeId
            );

            const gradeViolations = violations.filter(
              (violation) =>
                violation.schoolId === schoolId &&
                gradeStudents.some(
                  (student) => student.id === violation.studentId
                )
            );

            return {
              id: gradeId,
              name: grade?.name ?? gradeId,
              sectionCount: schoolSections.filter(
                (section) =>
                  section.gradeId === gradeId &&
                  section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
              ).length,
              studentCount: gradeStudents.length,
              violationCount: gradeViolations.length,
            };
          })
      .sort(
        (a, b) =>
          b.violationCount - a.violationCount ||
          a.name.localeCompare(b.name)
      );
  }, [schoolId]);

  const selectedGrade = gradeOverviews.find(
    (grade) => grade.id === selectedGradeId
  );

  const sectionOverviews = useMemo<SectionOverview[]>(() => {
    if (!selectedGradeId) {
      return [];
    }

    const gradeSections = sections.filter(
      (section) =>
        section.schoolId === schoolId &&
        section.gradeId === selectedGradeId &&
        section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );

    return gradeSections
      .map((section) => {
        const sectionStudents = students.filter(
          (student) =>
            student.schoolId === schoolId &&
            student.sectionId === section.id
        );

        const sectionViolations = violations.filter(
          (violation) =>
            violation.schoolId === schoolId &&
            sectionStudents.some(
              (student) => student.id === violation.studentId
            )
        );

        return {
          id: section.id,
          name: section.name,
          studentCount: sectionStudents.length,
          violationCount: sectionViolations.length,
        };
      })
      .sort(
        (a, b) =>
          b.violationCount - a.violationCount ||
          a.name.localeCompare(b.name)
      );
  }, [schoolId, selectedGradeId]);

  if (!school) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            المدرسة غير موجودة
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            لم يتم العثور على المدرسة المطلوبة.
          </p>

          <button
            type="button"
            onClick={() => navigate("/owner/schools")}
            className="mt-6 rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            العودة إلى المدارس
          </button>
        </div>
      </section>
    );
  }

  const schoolStudents = useMemo(
    () => {
      // Get student IDs that have active enrollment in current academic year for this school
      const currentYearStudentIds = new Set(
        enrollments
          .filter(
            (e) =>
              e.schoolId === schoolId &&
              e.academicYearId === CURRENT_ACADEMIC_YEAR_ID &&
              e.status === "active"
          )
          .map((e) => e.studentId)
      );

      return students.filter(
        (student) => student.schoolId === schoolId && currentYearStudentIds.has(student.id)
      );
    },
    [schoolId]
  );
  const schoolViolations = useMemo(
    () => violations.filter((violation) => violation.schoolId === schoolId),
    [schoolId]
  );
  const studentCount = schoolStudents.length;
  const violationCount = schoolViolations.length;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/owner/schools")}
            className="mb-4 text-sm font-medium text-[var(--brand-primary)] transition hover:opacity-80"
          >
            ← العودة إلى المدارس
          </button>

          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            تفاصيل المدرسة
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            {school.name}
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {school.location}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
            school.status === "active"
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-neutral-500/10 text-neutral-600"
          }`}
        >
          {school.status === "active"
            ? "المدرسة نشطة"
            : "المدرسة غير نشطة"}
        </span>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            إجمالي الطلاب
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {studentCount.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            إجمالي المخالفات
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {violationCount.toLocaleString("en-US")}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            حسابات المديرين
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {school.admins}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            متوسط المخالفات لكل طالب
          </p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {studentCount > 0
              ? (violationCount / studentCount).toFixed(2)
              : "0"}
          </p>
        </div>
      </div>

      {/* Grades Overview */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              نظرة عامة على الصفوف
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              الصفوف الموجودة في هذه المدرسة وعدد شعبها وطلابها ومخالفاتها
            </p>
          </div>

          <span className="w-fit rounded-full bg-[var(--brand-primary-light)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-primary)]">
            {gradeOverviews.length} صفوف
          </span>
        </div>

        {gradeOverviews.length > 0 ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {gradeOverviews.map((grade) => (
              <button
                key={grade.id}
                type="button"
                onClick={() =>
                  setSelectedGradeId((current) =>
                    current === grade.id ? null : grade.id
                  )
                }
                className={`group rounded-[var(--radius-md)] border p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] ${
                  selectedGradeId === grade.id
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary-light)]"
                    : "border-[var(--border-light)] bg-[var(--surface)] hover:border-[var(--brand-primary)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-navy)] text-lg text-[var(--accent-gold)]">
                      ▦
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[var(--text-primary)]">
                        {grade.name}
                      </h3>

                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {grade.sectionCount} شعب
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-[var(--danger-light)] px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
                    {grade.violationCount} مخالفة
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-light)] pt-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">
                      الطلاب
                    </p>

                    <p className="mt-1 font-bold text-[var(--text-primary)]">
                      {grade.studentCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--text-muted)]">
                      الشعب
                    </p>

                    <p className="mt-1 font-bold text-[var(--text-primary)]">
                      {grade.sectionCount}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد صفوف مسجلة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              لم يتم العثور على صفوف تحتوي على طلاب في هذه المدرسة.
            </p>
          </div>
        )}
      </section>

      {/* Sections Overview for the selected grade */}
      {selectedGrade && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                شعب {selectedGrade.name}
              </h2>

              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                الشعب التابعة لهذا الصف وعدد طلابها ومخالفاتها
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedGradeId(null)}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
            >
              إغلاق
            </button>
          </div>

          {sectionOverviews.length > 0 ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {sectionOverviews.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    navigate(`/owner/students?sectionId=${section.id}`)
                  }
                  className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface)] p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-lg text-[var(--brand-primary)]">
                        ▤
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[var(--text-primary)]">
                          {section.name}
                        </h3>

                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {section.studentCount} طالب
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-[var(--danger-light)] px-2.5 py-1 text-xs font-medium text-[var(--danger)]">
                      {section.violationCount} مخالفة
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-light)] pt-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">
                        الطلاب
                      </p>

                      <p className="mt-1 font-bold text-[var(--text-primary)]">
                        {section.studentCount}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-muted)]">
                        المخالفات
                      </p>

                      <p className="mt-1 font-bold text-[var(--text-primary)]">
                        {section.violationCount}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                لا توجد شعب مسجلة
              </p>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                لم يتم العثور على شعب تابعة لهذا الصف في هذه المدرسة.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Dashboard sections */}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            إحصائيات المخالفات
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            سيتم هنا عرض الرسومات والإحصائيات التفصيلية للمخالفات، مثل أنواع
            المخالفات والصفوف والشعب والفترات الزمنية.
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            نشاط المدرسة
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            سيتم هنا عرض آخر العمليات والمخالفات المسجلة في هذه المدرسة.
          </p>
        </section>
      </div>
    </section>
  );
}