import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  students,
  grades,
  sections,
  violations,
  guardianCalls,
  calculateStudentPoints,
  calculateCurrentCyclePoints,
  isGuardianCallRequired,
  GUARDIAN_CALL_THRESHOLD,
  recordGuardianCall,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";
import { useAdminContext } from "./adminContext";
import { notifyAdminGuardianCallMade } from "./adminNotifications";
import { addSessionActivity } from "../Owner/sessionActivity";

const GUARDIAN_CALLS_STORAGE_KEY = "alghassania_guardian_calls";

function readRecordedCalls(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(GUARDIAN_CALLS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function writeRecordedCalls(recorded: Record<string, number>) {
  try {
    window.localStorage.setItem(
      GUARDIAN_CALLS_STORAGE_KEY,
      JSON.stringify(recorded)
    );
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

type StudentRow = {
  id: string;
  fullName: string;
  gradeName: string;
  sectionName: string;
  violationCount: number;
  totalPoints: number;
  currentCyclePoints: number;
  callsMade: number;
  requiresGuardianCall: boolean;
};

export function AdminStudentsPage() {
  const { schoolId } = useAdminContext();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gradeFromUrl = searchParams.get("gradeId");
  const sectionFromUrl = searchParams.get("sectionId");

  const [gradeFilter, setGradeFilter] = useState<string>(
    gradeFromUrl ?? "all"
  );
  const [sectionFilter, setSectionFilter] = useState<string>(
    sectionFromUrl ?? "all"
  );

  const [recordedCalls, setRecordedCalls] = useState<Record<string, number>>(
    readRecordedCalls
  );

  useEffect(() => {
    writeRecordedCalls(recordedCalls);
  }, [recordedCalls]);

  const handleRecordGuardianCall = useCallback(
    (studentId: string) => {
      const student = students.find(
        (item) => item.id === studentId && item.schoolId === schoolId
      );

      if (!student) return;

      const nextCallNumber = (recordedCalls[studentId] ?? 0) + 1;
      const nextCalls = { ...recordedCalls, [studentId]: nextCallNumber };

      setRecordedCalls(nextCalls);

      // Use the shared helper to create the guardian call record
      const newCall = recordGuardianCall(
        studentId,
        student.guardianId,
        schoolId,
        "admin",
        guardianCalls
      );
      console.log("Recorded guardian call:", newCall);

      notifyAdminGuardianCallMade(
        schoolId,
        studentId,
        student.fullName,
        nextCallNumber,
        nextCalls
      );

      addSessionActivity({
        type: "guardian_call_made",
        title: student.fullName,
        message: `تم تسجيل اتصال بولي الأمر للطالب ${student.fullName} (الاتصال رقم ${nextCallNumber}).`,
        studentId,
        studentName: student.fullName,
      });
    },
    [recordedCalls, schoolId]
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

  const studentRows = useMemo<StudentRow[]>(() => {
    return students
      .filter((student) => student.schoolId === schoolId)
      .filter((student) => {
        if (gradeFilter !== "all" && student.gradeId !== gradeFilter) {
          return false;
        }

        if (
          sectionFilter !== "all" &&
          student.sectionId !== sectionFilter
        ) {
          return false;
        }

        return true;
      })
      .map((student) => {
        const grade = grades.find((item) => item.id === student.gradeId);
        const section = sections.find(
          (item) => item.id === student.sectionId
        );

        const studentViolations = violations.filter(
          (violation) => violation.studentId === student.id
        );

        const callsMade = recordedCalls[student.id] ?? 0;
        const totalPoints = calculateStudentPoints(student.id, violations);
        const currentCyclePoints = calculateCurrentCyclePoints(student.id, violations, guardianCalls);
        const requiresGuardianCall = isGuardianCallRequired(student.id, violations, guardianCalls, GUARDIAN_CALL_THRESHOLD);

        return {
          id: student.id,
          fullName: student.fullName,
          gradeName: grade?.name ?? "غير محدد",
          sectionName: section?.name ?? "غير محدد",
          violationCount: studentViolations.length,
          totalPoints,
          currentCyclePoints,
          callsMade,
          requiresGuardianCall,
        };
      })
      .sort((a, b) => {
        const pointsDiff = a.totalPoints - b.totalPoints;
        if (pointsDiff !== 0) {
          return pointsDiff;
        }

        if (a.requiresGuardianCall !== b.requiresGuardianCall) {
          return a.requiresGuardianCall ? -1 : 1;
        }

        return a.fullName.localeCompare(b.fullName);
      });
  }, [schoolId, gradeFilter, sectionFilter, recordedCalls]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            الطلاب
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            طلاب المدرسة
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            عرض طلاب مدرستك مرتبين حسب النقاط المخصومة مع إمكانية التصفية
            الهرمية.
          </p>
        </div>

        {studentRows.length > 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-background)] px-4 py-3 shadow-[var(--shadow-sm)]">
            <p className="text-xs text-[var(--text-secondary)]">
              إجمالي الطلاب
            </p>

            <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">
              {studentRows.length}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label
            htmlFor="admin-student-grade"
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            الصف
          </label>

          <select
            id="admin-student-grade"
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
            htmlFor="admin-student-section"
            className={`mb-2 block text-sm font-medium ${
              sectionDisabled
                ? "text-[var(--text-muted)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            الشعبة
          </label>

          <select
            id="admin-student-section"
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

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setGradeFilter("all");
              setSectionFilter("all");
            }}
            className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            مسح التصفية
          </button>
        </div>
      </div>

      {studentRows.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="divide-y divide-[var(--card-border)]">
            {studentRows.map((student) => (
              <div
                key={student.id}
                className={`flex flex-col gap-4 p-4 transition-colors duration-200 sm:flex-row sm:items-center sm:justify-between ${
                  student.requiresGuardianCall
                    ? "bg-[var(--danger-light)]"
                    : "hover:bg-[var(--surface-muted)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => navigate(`/admin/students/${student.id}`)}
                  className="flex min-w-0 items-center gap-3 text-right"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                      student.requiresGuardianCall
                        ? "bg-[var(--danger)]"
                        : "bg-[var(--brand-navy)]"
                    }`}
                  >
                    {student.fullName.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {student.fullName}
                      </p>

                      {student.callsMade > 0 && (
                        <span
                          title={`تم التواصل مع ولي الأمر ${student.callsMade} مرة`}
                          className="shrink-0 rounded-full bg-[var(--danger)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-inverse)]"
                        >
                          🚫 {student.callsMade} اتصال
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                      {student.gradeName} • {student.sectionName}
                    </p>
                  </div>
                </button>

                <div className="flex shrink-0 flex-wrap items-center gap-4 sm:gap-8">
                  <div className="text-left">
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {student.violationCount}
                    </p>

                    <p className="text-[11px] text-[var(--text-secondary)]">
                      مخالفات
                    </p>
                  </div>

                  <div className="text-left">
                    <p
                      className={`text-sm font-bold ${
                        student.totalPoints < 0
                          ? "text-[var(--danger)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {student.totalPoints}
                    </p>

                    <p className="text-[11px] text-[var(--text-secondary)]">
                      إجمالي النقاط
                    </p>
                  </div>

                  <div className="text-left">
                    <p
                      className={`text-sm font-bold ${
                        student.currentCyclePoints < 0
                          ? "text-[var(--danger)]"
                          : "text-[var(--text-primary)]"
                      }`}
                    >
                      {student.currentCyclePoints}
                    </p>

                    <p className="text-[11px] text-[var(--text-secondary)]">
                      نقاط الدورة الحالية
                    </p>
                  </div>

                  {student.requiresGuardianCall && (
                    <button
                      type="button"
                      onClick={() => handleRecordGuardianCall(student.id)}
                      className="rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] shadow-[var(--shadow-sm)] transition-colors hover:opacity-90"
                    >
                      استدعاء ولي الأمر
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-background)] px-6 py-14 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">
            لا يوجد طلاب مطابقون
          </p>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            لم يتم العثور على طلاب تنطبق عليهم التصفية الحالية.
          </p>
        </div>
      )}
    </section>
  );
}
