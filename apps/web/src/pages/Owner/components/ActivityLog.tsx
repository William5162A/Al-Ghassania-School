import { useNavigate } from "react-router";
import {
  violations,
  students,
  schools,
  violationTypes,
} from "@shared/data/mockData";

export function ActivityLog() {
  const navigate = useNavigate();

  const latestViolations = [...violations]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6);

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
      <div className="border-b border-[var(--border-light)] p-5">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          آخر المخالفات
        </h2>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          آخر المخالفات المسجلة في النظام
        </p>
      </div>

      <div className="divide-y divide-[var(--border-light)]">
        {latestViolations.map((violation) => {
          const student = students.find(
            (item) => item.id === violation.studentId
          );

          const school = schools.find(
            (item) => item.id === violation.schoolId
          );

          const violationType = violationTypes.find(
            (item) => item.id === violation.violationTypeId
          );

          return (
            <button
              key={violation.id}
              type="button"
              onClick={() => navigate(`/owner/students/${student?.id ?? ""}`)}
              className="flex w-full gap-3 p-4 text-right transition-colors duration-200 hover:bg-[var(--surface-muted)]"
            >
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary-light)] text-sm font-bold text-[var(--brand-primary)]">
                !
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {student?.fullName ?? "طالب غير معروف"}
                  </p>

                  <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                    {violation.points} نقطة
                  </span>
                </div>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {violationType?.name ?? "مخالفة"}
                </p>

                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {school?.name ?? "مدرسة غير معروفة"}
                </p>
              </div>

              <span className="shrink-0 text-xs text-[var(--text-muted)]">
                {violation.date}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}