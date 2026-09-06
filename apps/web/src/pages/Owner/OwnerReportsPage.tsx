import { useMemo, useState } from "react";
import {
  schools,
  grades,
  sections,
  students,
  violations,
  violationTypes,
  CURRENT_ACADEMIC_YEAR_ID,
  calculateStudentPoints,
} from "@shared/data/mockData";
import { exportOwnerReport } from "@/utils/exportReports";

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

export function OwnerReportsPage() {
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const schoolGradeIds = useMemo(() => {
    const map = new Map<string, Set<string>>();
    sections.forEach((section) => {
      if (!map.has(section.schoolId)) {
        map.set(section.schoolId, new Set());
      }
      map.get(section.schoolId)?.add(section.gradeId);
    });
    return map;
  }, []);

  const gradeOptions = useMemo(() => {
    if (schoolFilter !== "all") {
      const ids = schoolGradeIds.get(schoolFilter);
      if (ids) {
        return grades
          .filter((grade) => ids.has(grade.id))
          .map((grade) => ({ id: grade.id, name: grade.name }));
      }
      return [];
    }
    return grades.map((grade) => ({ id: grade.id, name: grade.name }));
  }, [schoolFilter, schoolGradeIds]);

  const sectionDisabled = schoolFilter === "all" || gradeFilter === "all";

  const sectionOptions = useMemo(() => {
    if (sectionDisabled) {
      return [];
    }
    return sections
      .filter(
        (section) =>
          section.schoolId === schoolFilter &&
          section.gradeId === gradeFilter &&
          section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
      )
      .map((section) => ({ id: section.id, name: section.name }));
  }, [sectionDisabled, schoolFilter, gradeFilter]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (schoolFilter !== "all" && student.schoolId !== schoolFilter) {
        return false;
      }
      if (gradeFilter !== "all" && student.gradeId !== gradeFilter) {
        return false;
      }
      if (sectionFilter !== "all" && student.sectionId !== sectionFilter) {
        return false;
      }
      return true;
    });
  }, [schoolFilter, gradeFilter, sectionFilter]);

  const studentIds = useMemo(
    () => new Set(filteredStudents.map((student) => student.id)),
    [filteredStudents]
  );

  const filteredViolations = useMemo(() => {
    return violations.filter((violation) => {
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
  }, [studentIds, typeFilter, dateFrom, dateTo]);

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

  const schoolCount = useMemo(() => {
    if (schoolFilter !== "all") {
      return filteredStudents.length > 0 ? 1 : 0;
    }
    return schools.length;
  }, [schoolFilter, filteredStudents.length]);

  const violationTypeCount = useMemo(() => {
    if (typeFilter !== "all") {
      return 1;
    }
    return violationTypes.length;
  }, [typeFilter]);

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
        return { typeId, name: type?.name ?? "غير محدد", ...stat };
      })
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filteredViolations]);

  const maxTypeCount =
    violationTypeStats.length > 0 ? violationTypeStats[0].count : 0;

  const schoolStats = useMemo(() => {
    const counts = new Map<string, number>();

    filteredViolations.forEach((violation) => {
      counts.set(
        violation.schoolId,
        (counts.get(violation.schoolId) ?? 0) + 1
      );
    });

    return Array.from(counts.entries())
      .map(([schoolId, count]) => ({
        schoolId,
        name: schools.find((item) => item.id === schoolId)?.name ?? "غير محدد",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredViolations]);

  const maxSchoolCount = schoolStats.length > 0 ? schoolStats[0].count : 0;

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
        const grade = grades.find(
          (item) => item.id === student?.gradeId
        );
        const section = sections.find(
          (item) => item.id === student?.sectionId
        );
        const studentPoints = studentPointsMap.get(studentId) ?? 0;
        return {
          studentId,
          name: student?.fullName ?? "غير محدد",
          gradeName: grade?.name ?? "غير محدد",
          sectionName: section?.name ?? "غير محدد",
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
    setSchoolFilter("all");
    setGradeFilter("all");
    setSectionFilter("all");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleExport = () => {
    try {
      exportOwnerReport(schoolFilter, filteredViolations, filteredStudents, studentPointsMap);
    } catch (error) {
      console.error("Export failed:", error);
      alert("فشل التصدير. يرجى المحاولة مرة أخرى.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            التقارير
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            تقارير الأنظمة والطلاب
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            تحليلات شاملة للمدارس والطلاب والمخالفات بناءً على بيانات النظام.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="report-school"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              المدرسة
            </label>

            <select
              id="report-school"
              value={schoolFilter}
              onChange={(event) => {
                const nextSchool = event.target.value;
                setSchoolFilter(nextSchool);

                const schoolHasGrade =
                  nextSchool === "all"
                    ? true
                    : schoolGradeIds.get(nextSchool)?.has(gradeFilter) ??
                      false;

                if (!schoolHasGrade) {
                  setGradeFilter("all");
                }

                setSectionFilter("all");
              }}
              className={inputClass}
            >
              <option value="all">جميع المدارس</option>

              {schools
                .filter((school) => school.status === "active")
                .map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="report-grade"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              الصف
            </label>

            <select
              id="report-grade"
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
              htmlFor="report-section"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              الشعبة
            </label>

            <select
              id="report-section"
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              disabled={sectionDisabled}
              className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60 ${
                sectionDisabled ? "bg-[var(--surface-muted)]" : ""
              }`}
            >
              <option value="all">
                {sectionDisabled
                  ? "اختر المدرسة والصف أولاً"
                  : "جميع الشعب"}
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
              htmlFor="report-type"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              نوع المخالفة
            </label>

            <select
              id="report-type"
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
              htmlFor="report-date-from"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              من تاريخ
            </label>

            <input
              id="report-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="report-date-to"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              إلى تاريخ
            </label>

            <input
              id="report-date-to"
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            الفترة المتاحة في البيانات: 2026-08-01 إلى 2026-08-28
          </p>

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
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="إجمالي الطلاب"
          value={filteredStudents.length.toLocaleString("en-US")}
          description="حسب التصفية الحالية"
          icon="♙"
        />

        <StatCard
          title="إجمالي المخالفات"
          value={filteredViolations.length.toLocaleString("en-US")}
          description="المخالفات المطابقة"
          icon="!"
        />

        <StatCard
          title="إجمالي النقاط المخصومة"
          value={totalDeductedPoints.toLocaleString("en-US")}
          description="مجموع نقاط المخالفات"
          icon="−"
        />

        <StatCard
          title="عدد المدارس"
          value={String(schoolCount)}
          description={schoolFilter === "all" ? "جميع المدارس" : "مدرسة محددة"}
          icon="⌂"
        />

        <StatCard
          title="عدد أنواع المخالفات"
          value={String(violationTypeCount)}
          description={
            typeFilter === "all" ? "جميع الأنواع" : "نوع محدد"
          }
          icon="▦"
        />
      </section>

      {/* Violation stats */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            إحصائيات المخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            أكثر أنواع المخالفات تكراراً مع مجموع النقاط المخصومة لكل نوع
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
                  <th className="px-5 py-3 font-medium">النقاط المخصومة</th>
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

                    <td className="px-5 py-4 font-semibold">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {item.count}
                    </td>

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

      {/* School stats */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            إحصائيات المدارس
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            ترتيب المدارس حسب عدد المخالفات
          </p>
        </div>

        {schoolStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">الترتيب</th>
                  <th className="px-5 py-3 font-medium">المدرسة</th>
                  <th className="px-5 py-3 font-medium">عدد المخالفات</th>
                  <th className="px-5 py-3 font-medium">النسبة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {schoolStats.map((item, index) => {
                  const isTop = index === 0;

                  return (
                    <tr
                      key={item.schoolId}
                      className={`text-sm text-[var(--text-primary)] ${
                        isTop ? "bg-[var(--brand-primary-light)]" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                            isTop
                              ? "bg-[var(--brand-primary)] text-white"
                              : "bg-[var(--accent-gold-light)] text-[var(--accent-gold-dark)]"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">{item.name}</p>

                        {isTop && (
                          <p className="mt-0.5 text-xs text-[var(--brand-primary)]">
                            المدرسة الأكثر تسجيلاً للمخالفات
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold">
                        {item.count.toLocaleString("en-US")}
                      </td>

                      <td className="px-5 py-4">
                        <Bar
                          ratio={
                            maxSchoolCount > 0
                              ? item.count / maxSchoolCount
                              : 0
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد بيانات مطابقة
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
            أعلى 10 طلاب حسب عدد المخالفات والنقاط المخصومة
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
                  <th className="px-5 py-3 font-medium">النقاط المخصومة</th>
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

                    <td className="px-5 py-4 font-semibold">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {item.gradeName}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {item.sectionName}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {item.count}
                    </td>

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
              لا توجد بيانات مطابقة
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