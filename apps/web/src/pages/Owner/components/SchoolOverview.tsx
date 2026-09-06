import { Fragment, useMemo } from "react";
import {
  schools,
  students,
  violations,
} from "@shared/data/mockData";

type SchoolOverviewProps = {
  onSchoolSelect: (schoolId: string) => void;
};

export function SchoolOverview({
  onSchoolSelect,
}: SchoolOverviewProps) {
  const schoolStats = useMemo(() => {
    const studentCounts = new Map<string, number>();
    const violationCounts = new Map<string, number>();

    students.forEach((student) => {
      studentCounts.set(student.schoolId, (studentCounts.get(student.schoolId) ?? 0) + 1);
    });

    violations.forEach((violation) => {
      violationCounts.set(violation.schoolId, (violationCounts.get(violation.schoolId) ?? 0) + 1);
    });

    return { studentCounts, violationCounts };
  }, []);

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-3 border-b border-[var(--border-light)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            المدارس
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            نظرة عامة على المدارس التابعة للنظام
          </p>
        </div>

        <button
          type="button"
          className="text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-dark)]"
        >
          عرض الكل
        </button>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-2">
        {schools.map((school) => (
          <Fragment key={school.id}>
            <button
            type="button"
            onClick={() => onSchoolSelect(school.id)}
            className="group rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--surface)] p-4 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:shadow-[var(--shadow-md)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-lg text-[var(--brand-primary)]">
                  ⌂
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-[var(--text-primary)]">
                    {school.name}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {school.location}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  school.status === "active"
                    ? "bg-[var(--success-light)] text-[var(--success)]"
                    : "bg-neutral-500/10 text-neutral-600"
                }`}
              >
                {school.status === "active"
                  ? "نشطة"
                  : "غير نشطة"}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border-light)] pt-4">
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  الطلاب
                </p>

                <p className="mt-1 font-bold text-[var(--text-primary)]">
                  {(schoolStats.studentCounts.get(school.id) ?? 0).toLocaleString("en-US")}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  المخالفات
                </p>

                <p className="mt-1 font-bold text-[var(--text-primary)]">
                  {(schoolStats.violationCounts.get(school.id) ?? 0).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </button>
          </Fragment>
        ))}
      </div>
    </section>
  );
}