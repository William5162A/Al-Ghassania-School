import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  violations,
  guardianCalls,
  students,
  violationTypes,
} from "@shared/data/mockData";
import {
  readSessionActivities,
  subscribeSessionActivity,
} from "./sessionActivity";
import type { SessionActivityType } from "./sessionActivity";

type LogEntry = {
  id: string;
  type: SessionActivityType | "violation_recorded" | "guardian_call_made";
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  date: string;
  sourceLabel: string;
};

const TYPE_LABELS: Record<LogEntry["type"], string> = {
  violation_recorded: "تسجيل مخالفة",
  guardian_call_made: "اتصال بولي الأمر",
  guardian_call_required: "طلب الاتصال بولي الأمر",
  violation_type_added: "إضافة نوع مخالفة",
  violation_type_points_edited: "تعديل نقاط نوع مخالفة",
  violation_points_edited: "تعديل نقاط مخالفة",
  violation_point_deleted: "حذف مخالفة",
};

const TYPE_ICONS: Record<LogEntry["type"], string> = {
  violation_recorded: "!",
  guardian_call_made: "✓",
  guardian_call_required: "!",
  violation_type_added: "+",
  violation_type_points_edited: "±",
  violation_points_edited: "✎",
  violation_point_deleted: "✕",
};

export function OwnerActivityLogPage() {
  const navigate = useNavigate();

  const [sessionActivities, setSessionActivities] = useState(
    readSessionActivities()
  );

  const [typeFilter, setTypeFilter] = useState("all");
  const [studentQuery, setStudentQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const refresh = () => setSessionActivities(readSessionActivities());
    const unsubscribe = subscribeSessionActivity(refresh);
    refresh();
    return unsubscribe;
  }, []);

  const entries = useMemo<LogEntry[]>(() => {
    const list: LogEntry[] = [];

    violations.forEach((violation) => {
      const student = students.find((item) => item.id === violation.studentId);
      const type = violationTypes.find(
        (item) => item.id === violation.violationTypeId
      );

      list.push({
        id: `violation-${violation.id}`,
        type: "violation_recorded",
        title: type?.name ?? "مخالفة",
        message: `تم تسجيل مخالفة (${Math.abs(violation.points)} نقطة)`,
        studentId: student?.id,
        studentName: student?.fullName ?? "غير محدد",
        date: violation.date,
        sourceLabel: "النظام",
      });
    });

    guardianCalls
      .filter((call) => call.status === "contacted")
      .forEach((call) => {
        const student = students.find((item) => item.id === call.studentId);

        list.push({
          id: `guardian-call-${call.id}`,
          type: "guardian_call_made",
          title: "اتصال ولي الأمر",
          message: "اكتمل استدعاء ولي الأمر بنجاح",
          studentId: student?.id,
          studentName: student?.fullName ?? "غير محدد",
          date: call.date,
          sourceLabel: "النظام",
        });
      });

    sessionActivities.forEach((activity) => {
      list.push({
        id: `session-${activity.id}`,
        type: activity.type,
        title: activity.title,
        message: activity.message,
        studentId: activity.studentId,
        studentName: activity.studentName,
        date: new Date(activity.createdAt).toISOString().slice(0, 10),
        sourceLabel: "جلسة حالية",
      });
    });

    return list.sort(
      (a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id)
    );
  }, [sessionActivities]);

  const filtered = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLowerCase();

    return entries.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) {
        return false;
      }

      if (
        normalizedQuery &&
        !(entry.studentName ?? "").toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      if (dateFrom && entry.date < dateFrom) {
        return false;
      }

      if (dateTo && entry.date > dateTo) {
        return false;
      }

      return true;
    });
  }, [entries, typeFilter, studentQuery, dateFrom, dateTo]);

  const sessionCount = useMemo(
    () => filtered.filter((entry) => entry.sourceLabel === "جلسة حالية").length,
    [filtered]
  );

  const systemCount = useMemo(
    () => filtered.filter((entry) => entry.sourceLabel === "النظام").length,
    [filtered]
  );

  const studentNameForEntry = (entry: LogEntry) =>
    entry.studentName ?? "غير محدد";

  const inputClass =
    "h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20";

  const resetFilters = () => {
    setTypeFilter("all");
    setStudentQuery("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            سجل الموقع
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            سجل الموقع / سجل النشاط
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            سجل يوضح العمليات والأحداث في النظام. الأحداث المسجلة خلال الجلسة
            الحالية تظهر كبيانات مؤقتة ولا تُعد سجلاً دائماً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-[var(--shadow-sm)]">
            <p className="text-xs text-[var(--text-secondary)]">
              أحداث النظام
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
              {systemCount.toLocaleString("en-US")}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-[var(--shadow-sm)]">
            <p className="text-xs text-[var(--text-secondary)]">
              أحداث الجلسة
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--accent-gold-dark)]">
              {sessionCount}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="log-type"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              نوع العملية
            </label>

            <select
              id="log-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className={inputClass}
            >
              <option value="all">جميع العمليات</option>

              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="log-student"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              الطالب
            </label>

            <input
              id="log-student"
              type="text"
              value={studentQuery}
              onChange={(event) => setStudentQuery(event.target.value)}
              placeholder="ابحث باسم الطالب..."
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="log-date-from"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              من تاريخ
            </label>

            <input
              id="log-date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="log-date-to"
              className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
            >
              إلى تاريخ
            </label>

            <input
              id="log-date-to"
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
            onClick={resetFilters}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            مسح التصفية
          </button>
        </div>
      </div>

      {/* Log table */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            سجل العمليات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {filtered.length.toLocaleString("en-US")} عملية مطابقة للتصفية
            الحالية
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-0 text-right">
              <thead>
                <tr className="border-b border-[var(--border-light)] text-xs text-[var(--text-muted)]">
                  <th className="px-5 py-3 font-medium">نوع العملية</th>
                  <th className="px-5 py-3 font-medium">العنصر المرتبط</th>
                  <th className="px-5 py-3 font-medium">الطالب</th>
                  <th className="px-5 py-3 font-medium">التاريخ</th>
                  <th className="px-5 py-3 font-medium">المصدر</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-light)]">
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="text-sm text-[var(--text-primary)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            entry.type === "guardian_call_made" ||
                            entry.type === "violation_type_added"
                              ? "bg-[var(--success-light)] text-[var(--success)]"
                              : entry.type === "guardian_call_required"
                                ? "bg-[var(--danger-light)] text-[var(--danger)]"
                                : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
                          }`}
                        >
                          {TYPE_ICONS[entry.type]}
                        </span>

                        <span className="font-semibold">
                          {TYPE_LABELS[entry.type]}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold">{entry.title}</p>

                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        {entry.message}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {entry.studentId ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/owner/students/${entry.studentId}`)
                          }
                          className="font-semibold text-[var(--brand-primary)] transition hover:opacity-80"
                        >
                          {studentNameForEntry(entry)}
                        </button>
                      ) : (
                        <span className="text-[var(--text-secondary)]">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-secondary)]">
                      {entry.date}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          entry.sourceLabel === "النظام"
                            ? "bg-[var(--surface-muted)] text-[var(--text-secondary)]"
                            : "bg-[var(--accent-gold-light)] text-[var(--accent-gold-dark)]"
                        }`}
                      >
                        {entry.sourceLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد عمليات مطابقة
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              عدّل التصفية لعرض السجل.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}