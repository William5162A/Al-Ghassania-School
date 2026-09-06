import {
  schools,
  students,
  violations,
} from "@shared/data/mockData";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
};

function StatCard({
  title,
  value,
  description,
  icon,
}: StatCardProps) {
  return (
    <article className="group rounded-[var(--radius-lg)] border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            {value}
          </p>

          <p className="mt-2 text-xs text-[var(--text-muted)]">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-lg text-[var(--brand-primary)] transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
    </article>
  );
}

export function OwnerStats() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="إجمالي المدارس"
        value={schools.length.toLocaleString("ar-SA")}
        description="المدارس المسجلة في النظام"
        icon="⌂"
      />

      <StatCard
        title="إجمالي الطلاب"
        value={students.length.toLocaleString("ar-SA")}
        description="جميع الطلاب في المدارس"
        icon="♙"
      />

      <StatCard
        title="إجمالي المخالفات"
        value={violations.length.toLocaleString("ar-SA")}
        description="المخالفات المسجلة حاليًا"
        icon="!"
      />

      <StatCard
        title="حسابات الإدارة"
        value={schools
          .reduce((total, school) => total + school.admins, 0)
          .toLocaleString("ar-SA")}
        description="حسابات Admin المسجلة"
        icon="✓"
      />
    </section>
  );
}