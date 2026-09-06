import { useMemo, useState } from "react";
import {
  grades,
  sections,
  students,
  violations,
  violationTypes,
  CURRENT_ACADEMIC_YEAR_ID,
  calculateStudentPoints,
} from "@shared/data/mockData";
import { useAdminContext } from "./adminContext";
import { exportAdminReport } from "@/utils/exportReports";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
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

function Bar({ ratio }: { ratio: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
      <div
        className="h-2 rounded-full bg-[var(--brand-primary)]"
        style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }}
      />
    </div>
  );
}

export function AdminReportsPage() {
  const { schoolId } = useAdminContext();

  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const gradeOptions = useMemo(() => {
    const schoolSections = sections.filter(
      (section) =>
        section.schoolId === schoolId &&
        section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );
    const schoolGradeIds = new Set(
      schoolSections.map((section) => section.gradeId)
    );

    return grades
      .filter((grade) => schoolGradeIds.has(grade.id))
      .map((grade) => ({ id: grade.id, name: grade.name }));
  }, [schoolId]);

  const sectionDisabled = gradeFilter === "all";

  const sectionOptions = useMemo(() => {
    if (sectionDisabled) {
      return [];
    }

    return sections
      .filter(
        (section) =>
          section.schoolId === schoolId &&
          section.gradeId === gradeFilter &&
          section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
      )
      .map((section) => ({ id: section.id, name: section.name }));
  }, [schoolId, gradeFilter, sectionDisabled]);

  const schoolStudents = useMemo(
    () => students.filter((student) => student.schoolId === schoolId),
    [schoolId]
  );

  const filteredStudents = useMemo(() => {
    return schoolStudents.filter((student) => {
      if (gradeFilter !== "all" && student.gradeId !== gradeFilter) {
        return false;
      }
      if (sectionFilter !== "all" && student.sectionId !== sectionFilter) {
        return false;
      }
      return true;
    });
  }, [schoolStudents, gradeFilter, sectionFilter]);

  const studentIds = useMemo(
    () => new Set(filteredStudents.map((student) => student.id)),
    [filteredStudents]
  );

  const filteredViolations = useMemo(() => {
    return violations.filter((violation) => {
      if (violation.schoolId !== schoolId) {
        return false;
      }
      if (!studentIds.has(violation.studentId)) {
        return false;
      }
      if (
        typeFilter !== "all" &&
        violation.violationTypeId !== typeFilter
      ) {
        return false;
      }
      if (dateFrom && violation.date < dateFrom) {
        return false;
      }
      if (dateTo && violation.date > dateTo) {
        return false;
      }
      return true;
    });
  }, [schoolId, studentIds, typeFilter, dateFrom, dateTo]);

  // Pre-compute actual student total points from ALL violations (not filtered)
  const studentPointsMap = useMemo(() => {
    const map = new Map<string, number>();
    filteredStudents.forEach((student) => {
      map.set(student.id, Math.abs(calculateStudentPoints(student.id, violations)));
    });
    return map;
  }, [filteredStudents]);

  const totalDeductedPoints = useMemo(
    () =>
      filteredStudents.reduce(
        (sum, student) => sum + (studentPointsMap.get(student.id) ?? 0),
        0
      ),
    [filteredStudents, studentPointsMap]
  );

  const violationTypeStats = useMemo(() => {
    const counts = new Map<string, { count: number; points: number }>();

    filteredViolations.forEach((violation) => {
      const current = counts.get(violation.violationTypeId) ?? {
        count: 0,
        points: 0,
      };
      current.count += 1;
      current.points += Math.abs(violation.points);
      counts.set(violation.violationTypeId, current);
    });

    return Array.from(counts.entries())
      .map(([typeId, stat]) => {
        const type = violationTypes.find((item) => item.id === typeId);
        return { typeId, name: type?.name ?? "غير محددة", ...stat };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredViolations]);

  const maxTypeCount =
    violationTypeStats.length > 0 ? violationTypeStats[0].count : 0;

  const gradeStats = useMemo(() => {
    const counts = new Map<string, { students: number; violations: number }>();

    filteredStudents.forEach((student) => {
      const current = counts.get(student.gradeId) ?? {
        students: 0,
        violations: 0,
      };
      current.students += 1;
      counts.set(student.gradeId, current);
    });

    filteredViolations.forEach((violation) => {
      const student = students.find(
        (item) => item.id === violation.studentId
      );
      if (!student) {
        return;
      }
      const current = counts.get(student.gradeId) ?? {
        students: 0,
        violations: 0,
      };
      current.violations += 1;
      counts.set(student.gradeId, current);
    });

    return Array.from(counts.entries())
      .map(([gradeId, stat]) => ({
        gradeId,
        name: grades.find((item) => item.id === gradeId)?.name ?? "غير محددة",
        ...stat,
      }))
      .sort((a, b) => b.violations - a.violations);
  }, [filteredStudents, filteredViolations]);

  const maxGradeViolations =
    gradeStats.length > 0 ? gradeStats[0].violations : 0;

  const studentStats = useMemo(() => {
    const counts = new Map<string, { count: number }>();

    filteredViolations.forEach((violation) => {
      const current = counts.get(violation.studentId) ?? {
        count: 0,
      };
      current.count += 1;
      counts.set(violation.studentId, current);
    });

    return Array.from(counts.entries())
      .map(([studentId, stat]) => {
        const student = students.find((item) => item.id === studentId);
        const grade = grades.find((item) => item.id === student?.gradeId);
        const section = sections.find(
          (item) => item.id === student?.sectionId
        );
        const studentPoints = studentPointsMap.get(studentId) ?? 0;
        return {
          studentId,
          name: student?.fullName ?? "غير محددة",
          gradeName: grade?.name ?? "غير محددة",
          sectionName: section?.name ?? "غير محددة",
          count: stat.count,
          points: studentPoints,
        };
      })
      .sort((a, b) => b.count - a.count || b.points - a.points)
      .slice(0, 10);
  }, [filteredViolations, studentPointsMap]);

  const maxStudentCount =
    studentStats.length > 0 ? studentStats[0].count : 0;

  const resetFilters = () => {
    setGradeFilter("all");
    setSectionFilter("all");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleExport = () => {
    try {
      exportAdminReport(schoolId, filteredViolations, filteredStudents, studentPointsMap);
    } catch (error) {
      console.error("Export failed:", error);
      alert("فشل التصدير. يرجى المحاولة مرة أخرى.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20";

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
          التقارير
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          تقارير المدرسة
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          تحليلات طلاب ومخالفات مدرستك فقط بناءً على بيانات النظام.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="admin-report-grade"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              الصف
            </label>

            <select
              id="admin-report-grade"
              value={gradeFilter}
              onChange={(event) => {
                setGradeFilter(event.target.value);
                setSectionFilter("all");
              }}
              className={inputClass}
            >
              <option value="all">جميع الصفوف</option>

              {gradeOptions.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-report-section"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              الشعبة
            </label>

            <select
              id="admin-report-section"
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              disabled={sectionDisabled}
              className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60 ${
                sectionDisabled ? "bg-[var(--surface-muted)]" : ""
              }`}
            >
              <option value="all">
                {sectionDisabled ? "اختر الصف أولاً" : "جميع الشعب"}
              </option>

              {sectionOptions.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-report-type"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              نوع المخالفة
            </label>

            <select
              id="admin-report-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">جميع الأنواع</option>

              {violationTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-report-date-from"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              من تاريخ
            </label>

            <input
              id="admin-report-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="admin-report-date-to"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              إلى تاريخ
            </label>

            <input
              id="admin-report-date-to"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl bg-[var(--accent-gold)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
          >
            تصدير البيانات
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            مسح التصفية
          </button>
        </div>
      </div>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="إجمالي الطلاب"
          value={filteredStudents.length.toLocaleString("en-US")}
          description="حسب التصفية الحالية"
          icon="👥"
        />

        <StatCard
          title="إجمالي المخالفات"
          value={filteredViolations.length.toLocaleString("en-US")}
          description="المخالفات المطابقة"
          icon="⚠️"
        />

        <StatCard
          title="إجمالي النقاط المخصومة"
          value={totalDeductedPoints.toLocaleString("en-US")}
          description="مجموع نقاط المخالفات"
          icon="📉"
        />

        <StatCard
          title="عدد أنواع المخالفات"
          value={String(
            typeFilter === "all" ? violationTypes.length : 1
          )}
          description={
            typeFilter === "all" ? "جميع الأنواع" : "نوع محدد"
          }
          icon="📋"
        />
      </section>

      {/* Violation type stats */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            إحصائيات المخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            أكثر أنواع المخالفات تكراراً مع مجموع النقاط المخصصة لكل نوع
          </p>
        </div>

        {violationTypeStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">الترتيب</th>
                  <th className="px-5 py-3 font-medium">نوع المخالفة</th>
                  <th className="px-5 py-3 font-medium">عدد المرات</th>
                  <th className="px-5 py-3 font-medium">النقاط المخصصة</th>
                  <th className="px-5 py-3 font-medium">النسبة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {violationTypeStats.map((item, index) => (
                  <tr
                    key={item.typeId}
                    className="text-sm text-[var(--text-primary)]"
                  >
                    <td className="px-5 py-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-gold-light)] text-sm font-bold text-[var(--accent-gold-dark)]">
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">{item.name}</td>

                    <td className="px-5 py-4 font-bold">{item.count}</td>

                    <td className="px-5 py-4 font-bold text-[var(--danger)]">
                      -{item.points}
                    </td>

                    <td className="px-5 py-4">
                      <Bar
                        ratio={
                          maxTypeCount > 0 ? item.count / maxTypeCount : 0
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد مخالفات مطابقة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              عدّل التصفية لعرض الإحصائيات.
            </p>
          </div>
        )}
      </section>

      {/* Grade stats */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            إحصائيات الصفوف
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            عدد الطلاب والمخالفات لكل صف
          </p>
        </div>

        {gradeStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">الصف</th>
                  <th className="px-5 py-3 font-medium">عدد الطلاب</th>
                  <th className="px-5 py-3 font-medium">عدد المخالفات</th>
                  <th className="px-5 py-3 font-medium">النسبة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {gradeStats.map((item) => (
                  <tr
                    key={item.gradeId}
                    className="text-sm text-[var(--text-primary)]"
                  >
                    <td className="px-5 py-4 font-semibold">{item.name}</td>

                    <td className="px-5 py-4 font-bold">
                      {item.students}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {item.violations}
                    </td>

                    <td className="px-5 py-4">
                      <Bar
                        ratio={
                          maxGradeViolations > 0
                            ? item.violations / maxGradeViolations
                            : 0
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد بيانات طلاب مطابقة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              عدّل التصفية لعرض الإحصائيات.
            </p>
          </div>
        )}
      </section>

      {/* Student stats */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            أكثر الطلاب تعرضاً للمخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            أعلى 10 طلاب حسب عدد المخالفات وإجمالي النقاط المخصصة
          </p>
        </div>

        {studentStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">الترتيب</th>
                  <th className="px-5 py-3 font-medium">الطالب</th>
                  <th className="px-5 py-3 font-medium">الصف</th>
                  <th className="px-5 py-3 font-medium">الشعبة</th>
                  <th className="px-5 py-3 font-medium">عدد المخالفات</th>
                  <th className="px-5 py-3 font-medium">النقاط المخصصة</th>
                  <th className="px-5 py-3 font-medium">النسبة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {studentStats.map((item, index) => (
                  <tr
                    key={item.studentId}
                    className="text-sm text-[var(--text-primary)]"
                  >
                    <td className="px-5 py-4">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-gold-light)] text-sm font-bold text-[var(--accent-gold-dark)]">
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">{item.name}</td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {item.gradeName}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {item.sectionName}
                    </td>

                    <td className="px-5 py-4 font-bold">{item.count}</td>

                    <td className="px-5 py-4 font-bold text-[var(--danger)]">
                      -{item.points}
                    </td>

                    <td className="px-5 py-4">
                      <Bar
                        ratio={
                          maxStudentCount > 0
                            ? item.count / maxStudentCount
                            : 0
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد بيانات طلاب مطابقة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              عدّل التصفية لعرض الإحصائيات.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}