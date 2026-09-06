import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  students,
  schools,
  grades,
  sections,
  guardians,
  violations,
  violationTypes,
  periods,
  teachers,
  subjects,
  guardianCalls,
  calculateStudentPoints,
  calculateCurrentCyclePoints,
  isGuardianCallRequired,
  getStudentGuardianCalls,
  GUARDIAN_CALL_THRESHOLD,
} from "@shared/data/mockData";

type ViolationRow = {
  id: string;
  name: string;
  points: number;
  date: string;
  periodName: string;
  subjectName: string;
  teacherName: string;
};

type GuardianCallRow = {
  id: string;
  callNumber: number;
  date: string;
  status: string;
  recordedBy: string;
};

export function StudentDetailsPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const profile = useMemo(() => {
    if (!studentId) {
      return null;
    }

    const student = students.find((item) => item.id === studentId);

    if (!student) {
      return null;
    }

    const school = schools.find(
      (item) => item.id === student.schoolId
    );
    const grade = grades.find(
      (item) => item.id === student.gradeId
    );
    const section = sections.find(
      (item) => item.id === student.sectionId
    );
    const guardian = guardians.find(
      (item) => item.id === student.guardianId
    );

    const studentViolations = violations.filter(
      (violation) => violation.studentId === student.id
    );

    const violationRows: ViolationRow[] = studentViolations
      .map((violation) => {
        const violationType = violationTypes.find(
          (item) => item.id === violation.violationTypeId
        );
        const period = periods.find(
          (item) => item.id === violation.periodId
        );
        const teacher = teachers.find(
          (item) => item.id === violation.teacherId
        );
        const subject = subjects.find(
          (item) => item.id === teacher?.subjectId
        );

        return {
          id: violation.id,
          name: violationType?.name ?? "مخالفة",
          points: violation.points,
          date: violation.date,
          periodName: period?.name ?? "غير محدد",
          subjectName: subject?.name ?? "غير محدد",
          teacherName: teacher?.name ?? "غير محدد",
        };
      })
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.id.localeCompare(a.id)
      );

    // Use shared helpers for guardian calls
    const studentGuardianCalls = getStudentGuardianCalls(student.id, guardianCalls);
    const totalPoints = calculateStudentPoints(student.id, violations);
    const currentCyclePoints = calculateCurrentCyclePoints(student.id, violations, guardianCalls);
    const requiresCall = isGuardianCallRequired(student.id, violations, guardianCalls, GUARDIAN_CALL_THRESHOLD);

    const guardianCallRows: GuardianCallRow[] = studentGuardianCalls
      .filter(c => c.status === "contacted")
      .map((call) => ({
        id: call.id,
        callNumber: call.callNumber,
        date: call.date,
        status: call.status,
        recordedBy: call.recordedBy,
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.callNumber - a.callNumber);

    return {
      student,
      schoolName: school?.name ?? "غير محدد",
      gradeName: grade?.name ?? "غير محدد",
      sectionName: section?.name ?? "غير محدد",
      guardianName: guardian?.name ?? "غير محدد",
      guardianPhone: guardian?.phone ?? "غير محدد",
      violationRows,
      guardianCalls: guardianCallRows,
      totalPoints,
      currentCyclePoints,
      requiresCall,
    };
  }, [studentId]);

  if (!profile) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            الطالب غير موجود
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            لم يتم العثور على الطالب المطلوب.
          </p>

          <button
            type="button"
            onClick={() => navigate("/owner/students")}
            className="mt-6 rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            العودة إلى الطلاب
          </button>
        </div>
      </section>
    );
  }

  const { student } = profile;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/owner/students")}
            className="mb-4 text-sm font-medium text-[var(--brand-primary)] transition hover:opacity-80"
          >
            ← العودة إلى الطلاب
          </button>

          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            ملف الطالب
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              {student.fullName}
            </h1>

            {profile.guardianCalls.length > 0 && (
              <span
                title={`تم التواصل مع ولي الأمر ${profile.guardianCalls.length} مرة`}
                className="rounded-full bg-[var(--danger)] px-3 py-1 text-xs font-semibold text-[var(--text-inverse)]"
              >
                🚫 تم الاتصال {profile.guardianCalls.length} مرة
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {profile.gradeName} • {profile.sectionName}
          </p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            المدرسة
          </p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {profile.schoolName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            إجمالي النقاط
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              profile.totalPoints < 0
                ? "text-[var(--danger)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            {profile.totalPoints}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            نقاط الدورة الحالية
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${
              profile.currentCyclePoints < 0
                ? "text-[var(--danger)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            {profile.currentCyclePoints}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            عدد المخالفات
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            {profile.violationRows.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            الشعبة
          </p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {profile.sectionName}
          </p>
        </div>
      </div>

      {/* Guardian call status */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            حالة استدعاء ولي الأمر
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            الحد: {GUARDIAN_CALL_THRESHOLD} نقطة
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[var(--text-muted)]">
              حالة الاستدعاء
            </p>

            <p
              className={`mt-1 font-semibold ${
                profile.requiresCall
                  ? "text-[var(--danger)]"
                  : "text-[var(--success)]"
              }`}
            >
              {profile.requiresCall ? "مطلوب استدعاء ولي الأمر" : "لا يستدعي استدعاء"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)]">
              عدد استدعاءات ولي الأمر
            </p>

            <p className="mt-1 font-semibold text-[var(--text-primary)]">
              {profile.guardianCalls.length}
            </p>
          </div>
        </div>
      </section>

      {/* Guardian info */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            ولي الأمر
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            معلومات ولي أمر الطالب
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[var(--text-muted)]">
              اسم ولي الأمر
            </p>

            <p className="mt-1 font-semibold text-[var(--text-primary)]">
              {profile.guardianName}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)]">
              رقم الهاتف
            </p>

            <p
              dir="ltr"
              className="mt-1 text-right font-semibold text-[var(--text-primary)]"
            >
              {profile.guardianPhone}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)]">
              حالة التواصل
            </p>

            <p
              className={`mt-1 font-semibold ${
                profile.guardianCalls.length > 0
                  ? "text-[var(--danger)]"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {profile.guardianCalls.length > 0
                ? `تم التواصل ${profile.guardianCalls.length} مرة`
                : "لم يتم التواصل بعد"}
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--text-muted)]">
              آخر استدعاء
            </p>

            <p className="mt-1 font-semibold text-[var(--text-primary)]">
              {profile.guardianCalls.length > 0
                ? profile.guardianCalls[0].date
                : "—"}
            </p>
          </div>
        </div>
      </section>

      {/* Guardian call history */}
      {profile.guardianCalls.length > 0 && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--card-border)] p-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              سجل استدعاءات ولي الأمر
            </h2>
          </div>

          <div className="divide-y divide-[var(--card-border)]">
            {profile.guardianCalls.map((call) => (
              <div key={call.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary-light)] text-[var(--brand-primary)] font-bold text-sm">
                      {call.callNumber}
                    </span>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        استدعاء رقم {call.callNumber}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {call.recordedBy}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {call.date}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {call.status === "contacted" ? "تم الاتصال" : call.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Violation history */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            سجل المخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            جميع مخالفات هذا الطالب
          </p>
        </div>

        {profile.violationRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">المخالفة</th>
                  <th className="px-5 py-3 font-medium">النقاط</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المادة</th>
                  <th className="px-5 py-3 font-medium">المعلم</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {profile.violationRows.map((violation) => (
                  <tr
                    key={violation.id}
                    className="cursor-pointer text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                    onClick={() =>
                      navigate(`/owner/violations/${violation.id}`)
                    }
                  >
                    <td className="px-5 py-4 font-semibold">
                      {violation.name}
                    </td>

                    <td className="px-5 py-4 font-bold text-[var(--danger)]">
                      {violation.points}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {violation.date}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {violation.subjectName}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {violation.teacherName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد مخالفات
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              لم يتم تسجيل أي مخالفات لهذا الطالب.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
