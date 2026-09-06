import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  violations,
  violationTypes as seededViolationTypes,
  students,
  schools,
  grades,
  sections,
  teachers,
  subjects,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";
import type { ViolationType } from "@shared/data/mockData";
import { addSessionActivity } from "../Owner/sessionActivity";

type ViolationRow = {
  id: string;
  typeName: string;
  studentId: string;
  studentName: string;
  schoolName: string;
  points: number;
  date: string;
  subjectName: string;
  teacherName: string;
};

export function ViolationsPage() {
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [sessionViolationTypes, setSessionViolationTypes] = useState<
    ViolationType[]
  >([]);

  const [typePointsOverrides, setTypePointsOverrides] = useState<
    Record<string, number>
  >({});

  const [showCreateType, setShowCreateType] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [typePoints, setTypePoints] = useState("");
  const [typeError, setTypeError] = useState("");

  const allViolationTypes = useMemo(
    () => [...sessionViolationTypes, ...seededViolationTypes],
    [sessionViolationTypes]
  );

  const displayedViolationTypes = useMemo(
    () =>
      allViolationTypes.map((type) => ({
        ...type,
        points: typePointsOverrides[type.id] ?? type.points,
      })),
    [allViolationTypes, typePointsOverrides]
  );

  const schoolGradeIds = useMemo(() => {
    const map = new Map<string, Set<string>>();

    sections.forEach((section) => {
      if (section.academicYearId !== CURRENT_ACADEMIC_YEAR_ID) {
        return;
      }
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

  const sectionOptions = useMemo(() => {
    if (schoolFilter === "all" || gradeFilter === "all") {
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
  }, [schoolFilter, gradeFilter]);

  const sectionDisabled = schoolFilter === "all" || gradeFilter === "all";

  const filtered = useMemo<ViolationRow[]>(() => {
    return violations
      .filter((violation) => {
        if (
          typeFilter !== "all" &&
          violation.violationTypeId !== typeFilter
        ) {
          return false;
        }

        if (
          schoolFilter !== "all" &&
          violation.schoolId !== schoolFilter
        ) {
          return false;
        }

        if (gradeFilter !== "all") {
          const student = students.find(
            (item) => item.id === violation.studentId
          );
          if (!student || student.gradeId !== gradeFilter) {
            return false;
          }
        }

        if (sectionFilter !== "all") {
          const student = students.find(
            (item) => item.id === violation.studentId
          );
          if (!student || student.sectionId !== sectionFilter) {
            return false;
          }
        }

        if (dateFilter && !violation.date.includes(dateFilter.trim())) {
          return false;
        }

        return true;
      })
      .map((violation) => {
        const student = students.find(
          (item) => item.id === violation.studentId
        );
        const type = allViolationTypes.find(
          (item) => item.id === violation.violationTypeId
        );
        const school = schools.find(
          (item) => item.id === violation.schoolId
        );
        const teacher = teachers.find(
          (item) => item.id === violation.teacherId
        );
        const subject = subjects.find(
          (item) => item.id === teacher?.subjectId
        );

        return {
          id: violation.id,
          typeName: type?.name ?? "مخالفة",
          studentId: student?.id ?? "",
          studentName: student?.fullName ?? "غير محدد",
          schoolName: school?.name ?? "غير محدد",
          points: violation.points,
          date: violation.date,
          subjectName: subject?.name ?? "غير محدد",
          teacherName: teacher?.name ?? "غير محدد",
        } as ViolationRow;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [
    violations,
    allViolationTypes,
    typeFilter,
    schoolFilter,
    gradeFilter,
    sectionFilter,
    dateFilter,
  ]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();

    filtered.forEach((row) => {
      counts.set(row.typeName, (counts.get(row.typeName) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [filtered]);

  const resetTypeForm = () => {
    setTypeName("");
    setTypePoints("");
    setTypeError("");
  };

  const handleAddType = () => {
    const name = typeName.trim();

    if (!name) {
      setTypeError("يرجى إدخال اسم المخالفة.");
      return;
    }

    const points = Number(typePoints);
    if (!Number.isFinite(points) || typePoints.trim() === "") {
      setTypeError("يرجى إدخال عدد صحيح للنقاط المخصومة.");
      return;
    }

    const newType: ViolationType = {
      id: `session-type-${Date.now()}`,
      name,
      points,
    };

    setSessionViolationTypes((current) => [newType, ...current]);

    addSessionActivity({
      type: "violation_type_added",
      title: name,
      message: `تمت إضافة نوع مخالفة جديد: ${name} (نقاط الخصم: ${points}).`,
    });

    resetTypeForm();
    setShowCreateType(false);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            المخالفات
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            المخالفات
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            استعراض جميع المخالفات وتحليل أكثر الأنواع تكراراً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-[var(--shadow-sm)]">
            <p className="text-xs text-[var(--text-secondary)]">
              إجمالي المخالفات
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
              {filtered.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateType((value) => !value);
              if (showCreateType) {
                resetTypeForm();
              }
            }}
            className="rounded-xl bg-[var(--brand-navy)] px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
          >
            {showCreateType ? "إغلاق النموذج" : "+ إضافة نوع مخالفة جديد"}
          </button>
        </div>
      </div>

      {/* Create new violation type */}
      {showCreateType && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--card-border)] p-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              إضافة نوع مخالفة جديد
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              أضف نوعاً عاماً قابلاً لإعادة الاستخدام عند تسجيل مخالفة على
              طالب. سيكون متاحاً للاختيار خلال هذه الجلسة فقط ولن يُحفظ بشكل
              دائم.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="vt-name"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                اسم المخالفة
              </label>

              <input
                id="vt-name"
                type="text"
                value={typeName}
                onChange={(event) => setTypeName(event.target.value)}
                placeholder="مثال: التدخين في الصف"
                className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
              />
            </div>

            <div>
              <label
                htmlFor="vt-points"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                النقاط المخصومة
              </label>

              <input
                id="vt-points"
                type="number"
                value={typePoints}
                onChange={(event) => setTypePoints(event.target.value)}
                placeholder="مثال: 40"
                className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
              />
            </div>
          </div>

          {typeError && (
            <div className="mx-5 mb-4 rounded-xl bg-[var(--danger-light)] px-4 py-3 text-sm font-semibold text-[var(--danger)]">
              {typeError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--card-border)] p-5">
            <button
              type="button"
              onClick={() => {
                resetTypeForm();
                setShowCreateType(false);
              }}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleAddType}
              className="rounded-xl bg-[var(--brand-navy)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
            >
              إضافة النوع
            </button>
          </div>
        </section>
      )}

      {/* Session-added types */}
      {sessionViolationTypes.length > 0 && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--card-border)] p-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              أنواع مضافة خلال هذه الجلسة
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              هذه الأنواع غير محفوظة بشكل دائم وستختفي عند إعادة التحميل.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 p-5">
            {sessionViolationTypes.map((type) => (
              <span
                key={type.id}
                className="rounded-full border border-[var(--card-border)] bg-[var(--accent-gold-light)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-gold-dark)]"
              >
                {type.name} ({Math.abs(type.points)} نقطة)
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Edit violation type points */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            تعديل نقاط أنواع المخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            عدّل قيمة الخصم المعروضة للنوع خلال هذه الجلسة فقط. لا يؤثر التعديل
            على المخالفات المسجلة سابقاً ولا يُحفظ بشكل دائم.
          </p>
        </div>

        <div className="divide-y divide-[var(--border-light)]">
          {displayedViolationTypes.map((type) => {
            const isOverridden = typePointsOverrides[type.id] !== undefined;

            return (
              <div
                key={type.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {type.name}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    النقاط الأصلية: {Math.abs(type.points)}
                    {isOverridden && " • تم التعديل"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <input
                    type="number"
                    aria-label={`نقاط ${type.name}`}
                    value={Math.abs(type.points)}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value) && value >= 0) {
                        setTypePointsOverrides((current) => ({
                          ...current,
                          [type.id]: value,
                        }));
                      }
                    }}
                    onBlur={() => {
                      if (typePointsOverrides[type.id] !== undefined) {
                        addSessionActivity({
                          type: "violation_type_points_edited",
                          title: type.name,
                          message: `تم تعديل نقاط الخصم لنوع المخالفة "${type.name}" إلى ${typePointsOverrides[type.id]} نقطة خلال الجلسة.`,
                        });
                      }
                    }}
                    className="h-10 w-28 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
                  />

                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() =>
                        setTypePointsOverrides((current) => {
                          const next = { ...current };
                          delete next[type.id];
                          return next;
                        })
                      }
                      className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
                    >
                      استعادة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="violation-type"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            نوع المخالفة
          </label>

          <select
            id="violation-type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
          >
            <option value="all">جميع الأنواع</option>

            {displayedViolationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({Math.abs(type.points)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="violation-school"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            المدرسة
          </label>

          <select
            id="violation-school"
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
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
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
            htmlFor="violation-grade"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            الصف
          </label>

          <select
            id="violation-grade"
            value={gradeFilter}
            onChange={(event) => {
              setGradeFilter(event.target.value);
              setSectionFilter("all");
            }}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
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
            htmlFor="violation-section"
            className={`mb-2 block text-sm font-medium ${
              sectionDisabled
                ? "text-[var(--text-muted)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            الشعبة
          </label>

          <select
            id="violation-section"
            value={sectionFilter}
            onChange={(event) => setSectionFilter(event.target.value)}
            disabled={sectionDisabled}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
            htmlFor="violation-date"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            التاريخ
          </label>

          <input
            id="violation-date"
            type="text"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            placeholder="مثال: 2026-01 أو 01-15"
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setSchoolFilter("all");
              setGradeFilter("all");
              setSectionFilter("all");
              setDateFilter("");
            }}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            مسح التصفية
          </button>
        </div>
      </div>

      {/* Frequency summary */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            أكثر أنواع المخالفات تكراراً
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            حسب النتائج المعروضة
          </p>
        </div>

        <div className="divide-y divide-[var(--card-border)]">
          {typeCounts.length > 0 ? (
            typeCounts.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-gold-light)] text-sm font-bold text-[var(--accent-gold-dark)]">
                    {index + 1}
                  </span>

                  <p className="font-semibold text-[var(--text-primary)]">
                    {item.name}
                  </p>
                </div>

                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {item.count} مخالفة
                </p>
              </div>
            ))
          ) : (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                لا توجد نتائج
              </p>

              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                عدّل التصفية لعرض النتائج.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Violations table */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            قائمة المخالفات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            انقر على أي مخالفة لعرض تفاصيلها، أو على اسم الطالب لعرض ملفه.
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">نوع المخالفة</th>
                  <th className="px-5 py-3 font-medium">الطالب</th>
                  <th className="px-5 py-3 font-medium">المدرسة</th>
                  <th className="px-5 py-3 font-medium">النقاط</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المادة</th>
                  <th className="px-5 py-3 font-medium">المعلم</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((violation) => (
                  <tr
                    key={violation.id}
                    onClick={() =>
                      navigate(`/owner/violations/${violation.id}`)
                    }
                    className="cursor-pointer text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {violation.typeName}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/owner/students/${violation.studentId}`);
                        }}
                        className="font-semibold text-[var(--brand-primary)] transition hover:opacity-80"
                      >
                        {violation.studentName}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {violation.schoolName}
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
              لا توجد مخالفات مطابقة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              عدّل التصفية لعرض النتائج.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}