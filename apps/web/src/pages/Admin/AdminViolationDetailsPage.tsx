import { useMemo } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import {
  violations,
  violationTypes,
  students,
  grades,
  sections,
  teachers,
  periods,
  subjects,
} from "@shared/data/mockData";
import { useAdminContext } from "./adminContext";

export function AdminViolationDetailsPage() {
  const { schoolId, schoolName } = useAdminContext();
  const { violationId } = useParams<{ violationId: string }>();
  const navigate = useNavigate();

  const violationDetail = useMemo(() => {
    if (!violationId) {
      return null;
    }

    const violation = violations.find(
      (item) => item.id === violationId && item.schoolId === schoolId
    );

    if (!violation) {
      return null;
    }

    const student = students.find(
      (item) => item.id === violation.studentId
    );
    const type = violationTypes.find(
      (item) => item.id === violation.violationTypeId
    );
    const grade = grades.find((item) => item.id === student?.gradeId);
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
      typeName: type?.name ?? "غير محددة",
      points: violation.points,
      date: violation.date,
      studentId: student?.id ?? "",
      studentName: student?.fullName ?? "غير محددة",
      gradeName: grade?.name ?? "غير محددة",
      sectionName: section?.name ?? "غير محددة",
      teacherName: teacher?.name ?? "غير محددة",
      subjectName: subject?.name ?? "غير محددة",
      periodName: period?.name ?? "غير محددة",
    };
  }, [violationId, schoolId]);

  if (
    violationId &&
    !violations.some((item) => item.id === violationId && item.schoolId === schoolId)
  ) {
    return <Navigate to="/admin/violations" replace />;
  }

  if (!violationDetail) {
    return <Navigate to="/admin/violations" replace />;
  }

  return (
    <section className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/violations")}
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
          {schoolName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">
            النقاط المخصصة
          </p>

          <p className="mt-2 text-3xl font-bold text-[var(--danger)]">
            {violationDetail.points}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">التاريخ</p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.date}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">المادة</p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.subjectName}
          </p>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            الحصة: {violationDetail.periodName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">المعلم</p>

          <p className="mt-2 text-base font-bold text-[var(--text-primary)]">
            {violationDetail.teacherName}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
          <p className="text-sm text-[var(--text-secondary)]">الطالب</p>

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/students/${violationDetail.studentId}`)
            }
            className="mt-2 text-base font-bold text-[var(--brand-primary)] transition hover:opacity-80"
          >
            {violationDetail.studentName}
          </button>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            {violationDetail.gradeName} ⬢ {violationDetail.sectionName}
          </p>
        </div>
      </div>
    </section>
  );
}