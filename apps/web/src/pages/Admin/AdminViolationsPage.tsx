import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  violations as seededViolations,
  violationTypes,
  students,
  grades,
  sections,
  teachers,
  subjects,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";
import type { Violation } from "@shared/data/mockData";
import { useAdminContext } from "./adminContext";
import { addSessionActivity } from "../Owner/sessionActivity";

type ViolationRow = {
  id: string;
  typeName: string;
  studentId: string;
  studentName: string;
  points: number;
  date: string;
  subjectName: string;
  teacherName: string;
  violationTypeId: string;
  teacherId: string;
  periodId: string;
};

export function AdminViolationsPage() {
  const { schoolId } = useAdminContext();
  const navigate = useNavigate();

  const [typeFilter, setTypeFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [sessionViolations, setSessionViolations] = useState<Violation[]>([]);

  const [editTarget, setEditTarget] = useState<ViolationRow | null>(null);
  const [editPoints, setEditPoints] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const [deletedViolationIds, setDeletedViolationIds] = useState<
    Set<string>
  >(new Set());

  const allViolations = useMemo(
    () => [...sessionViolations, ...seededViolations],
    [sessionViolations]
  );

  const effectiveViolations = useMemo(
    () => allViolations.filter((v) => !deletedViolationIds.has(v.id)),
    [allViolations, deletedViolationIds]
  );

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

  const sectionOptions = useMemo(() => {
    if (gradeFilter === "all") {
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
  }, [schoolId, gradeFilter]);

  const sectionDisabled = gradeFilter === "all";

  const filtered = useMemo<ViolationRow[]>(() => {
    return effectiveViolations
      .filter((violation) => violation.schoolId === schoolId)
      .filter((violation) => {
        if (
          typeFilter !== "all" &&
          violation.violationTypeId !== typeFilter
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
        const type = violationTypes.find(
          (item) => item.id === violation.violationTypeId
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
          studentName: student?.fullName ?? "غير محددة",
          points: violation.points,
          date: violation.date,
          subjectName: subject?.name ?? "غير محددة",
          teacherName: teacher?.name ?? "غير محددة",
          violationTypeId: violation.violationTypeId,
          teacherId: violation.teacherId,
          periodId: violation.periodId,
        } as ViolationRow;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [
    effectiveViolations,
    schoolId,
    typeFilter,
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

  const openEdit = (row: ViolationRow) => {
    setEditTarget(row);
    setEditPoints(String(Math.abs(row.points)));
    setEditError("");
    setEditSuccess(null);
  };

  const handleSaveEdit = () => {
    if (!editTarget) {
      return;
    }

    const value = Number(editPoints);
    if (!Number.isFinite(value) || !editPoints.trim() || value <= 0) {
      setEditError("يرجى إدخال عدد صحيح أكبر من صفر.");
      return;
    }

    const existing = seededViolations.find(
      (v) => v.id === editTarget.id
    );
    const newViolation: Violation = existing
      ? { ...existing, points: -value }
      : {
          id: editTarget.id,
          studentId: editTarget.studentId,
          schoolId,
          violationTypeId: editTarget.violationTypeId ?? "",
          points: -value,
          teacherId: editTarget.teacherId ?? "",
          periodId: editTarget.periodId ?? "",
          date: editTarget.date,
        };

    setSessionViolations((current) => {
      const withoutOld = current.filter((v) => v.id !== editTarget.id);
      return [...withoutOld, newViolation];
    });

    if (existing) {
      setDeletedViolationIds((current) => {
        const next = new Set(current);
        return next;
      });
    }

    addSessionActivity({
      type: "violation_points_edited",
      title: editTarget.typeName,
      message: `تم تعديل نقاط المخالفة "${editTarget.typeName}" للطالب ${editTarget.studentName} إلى ${value} نقطة خارج الجلسة.`,
      studentId: editTarget.studentId,
      studentName: editTarget.studentName,
    });

    setEditSuccess(`تم تعديل المخالفة (تجريبياً لا يُحفظ بشكل دائم).`);
    setEditTarget(null);
    setEditPoints("");
  };

  const handleDelete = (row: ViolationRow) => {
    setDeletedViolationIds((current) => {
      const next = new Set(current);
      next.add(row.id);
      return next;
    });

    addSessionActivity({
      type: "violation_point_deleted",
      title: row.typeName,
      message: `تم حذف المخالفة "${row.typeName}" للطالب ${row.studentName} خارج الجلسة.`,
      studentId: row.studentId,
      studentName: row.studentName,
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            المخالفات
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            مخالفات المدرسة
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            استعراض مخالفات مدرستك مع إمكانية التعديل والحذف. تعديل النقاط يضيف أو يعدل المخالفات فقط داخل صفحتك.
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
            disabled
            title="إضافة مخالفة ستتوفر عبر سير عمل المديرين لاحقًا"
            className="cursor-not-allowed rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--text-muted)] opacity-70"
          >
            + إضافة مخالفة
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--accent-gold-light)]/40 px-4 py-3">
        <p className="text-xs leading-5 text-[var(--accent-gold-dark)]">
          زر "إضافة مخالفة" غير مفعل حالياً. سيُفعّل لاحقاً مع سير عمل المديرين في مرحلة لاحقة.
        </p>
      </section>

      {editSuccess && (
        <p className="rounded-xl bg-[var(--success-light)] px-4 py-3 text-sm font-medium text-[var(--success)]">
          {editSuccess}
        </p>
      )}

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="admin-violation-type"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            نوع المخالفة
          </label>

          <select
            id="admin-violation-type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
          >
            <option value="all">جميع الأنواع</option>

            {violationTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name} ({Math.abs(type.points)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="admin-violation-grade"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            الصف
          </label>

          <select
            id="admin-violation-grade"
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
            htmlFor="admin-violation-section"
            className={`mb-2 block text-sm font-medium ${
              sectionDisabled
                ? "text-[var(--text-muted)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            الشعبة
          </label>

          <select
            id="admin-violation-section"
            value={sectionFilter}
            onChange={(event) => setSectionFilter(event.target.value)}
            disabled={sectionDisabled}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 disabled:cursor-not-allowed disabled:opacity-60"
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
            htmlFor="admin-violation-date"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            التاريخ
          </label>

          <input
            id="admin-violation-date"
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
            اضغط على أي مخالفة لعرض تفاصيلها أو اضغط على اسم الطالب لعرض ملفه. التعديل والحذف للمخالفات (تغييرات الجلسة فقط).
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">نوع المخالفة</th>
                  <th className="px-5 py-3 font-medium">الطالب</th>
                  <th className="px-5 py-3 font-medium">النقاط</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المادة</th>
                  <th className="px-5 py-3 font-medium">المعلم</th>
                  <th className="px-5 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((violation) => (
                  <tr
                    key={violation.id}
                    className="group cursor-pointer text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)]"
                    onClick={() =>
                      navigate(`/admin/violations/${violation.id}`)
                    }
                  >
                    <td className="px-5 py-4 font-semibold">
                      {violation.typeName}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/admin/students/${violation.studentId}`);
                        }}
                        className="font-semibold text-[var(--brand-primary)] transition hover:opacity-80"
                      >
                        {violation.studentName}
                      </button>
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

                    <td className="px-5 py-4">
                      <div
                        className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => openEdit(violation)}
                          className="rounded-lg bg-[var(--brand-primary-light)] px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-primary)] transition hover:opacity-80"
                        >
                          تعديل
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(violation)}
                          className="rounded-lg bg-[var(--danger-light)] px-2.5 py-1.5 text-xs font-semibold text-[var(--danger)] transition hover:opacity-80"
                        >
                          حذف
                        </button>
                      </div>
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

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setEditTarget(null)}
            className="absolute inset-0 bg-[var(--brand-navy-dark)]/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] p-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  تعديل المخالفة
                </h2>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {editTarget.typeName} — {editTarget.studentName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditTarget(null)}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-lg text-[var(--text-secondary)] transition hover:bg-[var(--border-light)]"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div>
                <label
                  htmlFor="admin-edit-points"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  النقاط المخصصة
                </label>

                <input
                  id="admin-edit-points"
                  type="number"
                  value={editPoints}
                  onChange={(event) => {
                    setEditPoints(event.target.value);
                    setEditError("");
                  }}
                  className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
                />

                {editError && (
                  <p className="mt-1.5 text-xs text-[var(--danger)]">
                    {editError}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
                >
                  حفظ التعديل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}