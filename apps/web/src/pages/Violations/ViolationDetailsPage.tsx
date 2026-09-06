import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  violations,
  violationTypes,
  students,
  schools,
  grades,
  sections,
  teachers,
  periods,
  subjects,
} from "@shared/data/mockData";

export function ViolationDetailsPage() {
  const { violationId } = useParams<{ violationId: string }>();
  const navigate = useNavigate();

  const violationDetail = useMemo(() => {
    if (!violationId) {
      return null;
    }

    const violation = violations.find((item) => item.id === violationId);

    if (!violation) {
      return null;
    }

    const student = students.find(
      (item) => item.id === violation.studentId
    );
    const type = violationTypes.find(
      (item) => item.id === violation.violationTypeId
    );
    const school = schools.find(
      (item) => item.id === violation.schoolId
    );
    const grade = grades.find(
      (item) => item.id === student?.gradeId
    );
    const section = sections.find(
      (item) => item.id === student?.sectionId
    );
    const teacher = teachers.find(
      (item) => item.id === violation.teacherId
    );
    const subject = subjects.find(
      (item) => item.id === teacher?.subjectId
    );
    const period = periods.find(
      (item) => item.id === violation.periodId
    );

    return {
      id: violation.id,
      typeName: type?.name ?? "غير محدد",
      points: violation.points,
      date: violation.date,
      studentId: student?.id ?? "",
      studentName: student?.fullName ?? "غير محدد",
      gradeName: grade?.name ?? "غير محدد",
      sectionName: section?.name ?? "غير محدد",
      schoolName: school?.name ?? "غير محدد",
      teacherName: teacher?.name ?? "غير محدد",
      subjectName: subject?.name ?? "غير محدد",
      periodName: period?.name ?? "غير محدد",
    };
  }, [violationId]);

  if (!violationDetail) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-8 text-center shadow-[var(--shadow-sm)]">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            المخالفة غير موجودة
          </h1>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            لم يتم العثور على المخالفة المطلوبة.
          </p>

          <button
            type="button"
            onClick={() => navigate("/owner/violations")}
            className="mt-6 rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            العودة إلى المخالفات
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/owner/violations")}
          className="mb-4 text-sm font-medium text-[var(--brand-primary)] transition hover:opacity-80"
        >
          ← العودة إلى المخالفات
        </button>

        <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
          تفاصيل المخالفة
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          {violationDetail.typeName}
        </h1>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {violationDetail.schoolName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            النقاط المخصومة
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--danger)]">
            {violationDetail.points}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            التاريخ
          </p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.date}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            المادة
          </p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.subjectName}
          </p>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            الحصة: {violationDetail.periodName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            المعلم
          </p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.teacherName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            الطالب
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(`/owner/students/${violationDetail.studentId}`)
            }
            className="mt-2 text-base font-bold text-[var(--brand-primary)] transition hover:opacity-80"
          >
            {violationDetail.studentName}
          </button>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {violationDetail.gradeName} • {violationDetail.sectionName}
          </p>
        </div>
      </div>
    </section>
  );
}
