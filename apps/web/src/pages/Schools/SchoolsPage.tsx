import { useMemo, useState } from "react";
import { schools, type School } from "@shared/data/mockData";
import { useNavigate } from "react-router";

type StatusFilter = "all" | "active" | "inactive";

export function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const navigate = useNavigate();

  const filteredSchools = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return schools.filter((school) => {
      const matchesSearch =
        normalizedSearch === "" ||
        school.name.toLowerCase().includes(normalizedSearch) ||
        school.location.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || school.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  function getStatusLabel(status: School["status"]) {
    return status === "active" ? "نشطة" : "غير نشطة";
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            إدارة المدارس
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            المدارس
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            عرض المدارس التابعة للنظام ومتابعة أعداد الطلاب والمخالفات.
          </p>
        </div>

        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-[var(--shadow-sm)]">
          <p className="text-xs text-[var(--text-secondary)]">
            إجمالي المدارس
          </p>

          <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
            {schools.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          {/* Search */}
          <div>
            <label
              htmlFor="school-search"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              البحث عن مدرسة
            </label>

            <div className="relative">
              <input
                id="school-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث باسم المدرسة أو الموقع..."
                className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
              />
            </div>
          </div>

          {/* Status */}
          <div className="min-w-48">
            <label
              htmlFor="school-status"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              حالة المدرسة
            </label>

            <select
              id="school-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
            >
              <option value="all">جميع المدارس</option>
              <option value="active">نشطة</option>
              <option value="inactive">غير نشطة</option>
            </select>
          </div>
        </div>
      </div>
      {/* Results */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSchools.map((school) => (
          <article
            key={school.id}
            className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]"
          >
            {/* Top */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-navy)] text-[var(--accent-gold)]">
                  <span className="text-lg">▦</span>
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                    {school.name}
                  </h2>

                  <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                    {school.location}
                  </p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  school.status === "active"
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "bg-neutral-500/10 text-neutral-600"
                }`}
              >
                {getStatusLabel(school.status)}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-[var(--card-border)] rounded-xl bg-[var(--background)] p-3">
              <div className="px-2 text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {school.students}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  طالب
                </p>
              </div>

              <div className="px-2 text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {school.violations}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  مخالفة
                </p>
              </div>

              <div className="px-2 text-center">
                <p className="text-lg font-bold text-[var(--text-primary)]">
                  {school.admins}
                </p>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                  مدير
                </p>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => navigate(`/owner/schools/${school.id}`)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/5"
            >
              <span>عرض تفاصيل المدرسة</span>
              <span aria-hidden="true">←</span>
            </button>
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-background)] px-6 py-14 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">
            لم يتم العثور على مدارس
          </p>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            جرّب تغيير كلمة البحث أو حالة المدرسة.
          </p>
        </div>
      )}

      {/* Result Count */}
      <p className="text-xs text-[var(--text-secondary)]">
        عرض {filteredSchools.length} من أصل {schools.length} مدارس
      </p>
    </section>
  );
}