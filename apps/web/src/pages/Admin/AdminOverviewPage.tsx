import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  students,
  violations,
  sections,
  violationTypes,
  teachers,
  subjects,
  guardianCalls,
  calculateStudentPoints,
  isGuardianCallRequired,
  GUARDIAN_CALL_THRESHOLD,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";
import { useAdminContext } from "./adminContext";

export function AdminOverviewPage() {
  const { schoolId, schoolName, identity } = useAdminContext();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const schoolStudents = students.filter(
      (student) => student.schoolId === schoolId
    );
    const schoolViolations = violations.filter(
      (violation) => violation.schoolId === schoolId
    );

    const totalDeductedPoints = schoolStudents.reduce(
      (sum, student) => sum + Math.abs(calculateStudentPoints(student.id, violations)),
      0
    );

    const schoolSections = sections.filter(
      (section) =>
        section.schoolId === schoolId &&
        section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );
    const gradeCount = new Set(
      schoolSections.map((section) => section.gradeId)
    ).size;

    // Guardian Call statistics
    const studentsRequiringCall = schoolStudents.filter((student) =>
      isGuardianCallRequired(student.id, violations, guardianCalls, GUARDIAN_CALL_THRESHOLD)
    ).length;
    const callsRecorded = guardianCalls.filter(
      (call) => call.schoolId === schoolId && call.status === "contacted"
    ).length;

    return {
      studentCount: schoolStudents.length,
      violationCount: schoolViolations.length,
      totalDeductedPoints,
      gradeCount,
      sectionCount: schoolSections.length,
      studentsRequiringCall,
      callsRecorded,
    };
  }, [schoolId]);

  const recentViolations = useMemo(() => {
    return violations
      .filter((violation) => violation.schoolId === schoolId)
      .sort(
        (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
      )
      .slice(0, 6)
      .map((violation) => {
        const student = students.find(
          (item) => item.id === violation.studentId
        );
        const type = violationTypes.find(
          (item) => item.id === violation.violationTypeId
        );
        const teacher = teachers.find(
          (item) => item.id === violation.teacherId
        );
        const subject = subjects.find(
          (item) => item.id === teacher?.subjectId
        );

        return {
          id: violation.id,
          studentId: student?.id ?? "",
          studentName: student?.fullName ?? "غير محدد",
          typeName: type?.name ?? "مخالفة",
          points: violation.points,
          date: violation.date,
          subjectName: subject?.name ?? "غير محدد",
        };
      });
  }, [schoolId]);

  const statCards = [
    {
      title: "إجمالي الطلاب",
      value: stats.studentCount.toLocaleString("en-US"),
      icon: "♙",
    },
    {
      title: "إجمالي المخالفات",
      value: stats.violationCount.toLocaleString("en-US"),
      icon: "!",
    },
    {
      title: "إجمالي النقاط المخصومة",
      value: stats.totalDeductedPoints.toLocaleString("en-US"),
      icon: "−",
    },
    {
      title: "عدد الصفوف",
      value: String(stats.gradeCount),
      icon: "▦",
    },
    {
      title: "عدد الشعب",
      value: String(stats.sectionCount),
      icon: "⌂",
    },
    {
      title: "طلاب تتطلب استدعاء ولي أمر",
      value: String(stats.studentsRequiringCall),
      icon: "⚠",
    },
    {
      title: "استدعاءات ولي الأمر المسجلة",
      value: String(stats.callsRecorded),
      icon: "📞",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--brand-navy)] p-6 text-white shadow-[var(--shadow-md)] sm:p-8">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-gold)]/10 blur-2xl" />

        <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-[var(--brand-primary)]/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-medium text-[var(--accent-gold)]">
            لوحة مدير المدرسة
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            مرحباً {identity.username}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            أنت تدير مدرسة "{schoolName}". من هنا يمكنك متابعة الطلاب
            والمخالفات والتقارير الخاصة بمدرستك فقط.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[var(--radius-lg)] border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
          >
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {card.title}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              آخر المخالفات المسجلة
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              أحدث مخالفات مدرستك
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/violations")}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            عرض الكل
          </button>
        </div>

        {recentViolations.length > 0 ? (
          <div className="divide-y divide-[var(--card-border)]">
            {recentViolations.map((violation) => (
              <button
                key={violation.id}
                type="button"
                onClick={() =>
                  navigate(`/admin/violations/${violation.id}`)
                }
                className="flex w-full flex-col gap-3 p-4 text-right transition-colors duration-200 hover:bg-[var(--surface-muted)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {violation.typeName}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {violation.studentName} • {violation.subjectName}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {violation.date}
                  </span>

                  <span className="rounded-full bg-[var(--danger-light)] px-2.5 py-1 text-sm font-bold text-[var(--danger)]">
                    {violation.points}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد مخالفات مسجلة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              لم يتم تسجيل أي مخالفات لهذه المدرسة.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
