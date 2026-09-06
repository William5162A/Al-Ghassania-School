import { useMemo, useState } from "react";
import {
  classes,
  sections,
  students,
  violationTypes,
  teachers,
  subjects,
  periods,
  teacherAssignments,
  enrollments,
  CURRENT_ACADEMIC_YEAR_ID,
} from "@shared/data/mockData";
import { useMentorContext } from "./mentorContext";
import { addSessionActivity } from "../Owner/sessionActivity";

const MAX_DATE_AGE_DAYS = 14;

type ViolationFormData = {
  date: string;
  classId: string | null;
  sectionId: string | null;
  studentId: string | null;
  violationTypeId: string | null;
  periodId: string | null;
  subjectId: string | null;
  teacherId: string | null;
  notes: string;
};

type ValidationErrors = Partial<Record<keyof ViolationFormData, string>>;

export function RecordViolationPage() {
  const { schoolId, identity } = useMentorContext();

  const [formData, setFormData] = useState<ViolationFormData>({
    date: new Date().toISOString().split("T")[0],
    classId: null,
    sectionId: null,
    studentId: null,
    violationTypeId: null,
    periodId: null,
    subjectId: null,
    teacherId: null,
    notes: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - MAX_DATE_AGE_DAYS);
  const minDateStr = minDate.toISOString().split("T")[0];

  const schoolClasses = useMemo(() => {
    const schoolSections = sections.filter(
      (section) =>
        section.schoolId === schoolId &&
        section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );
    const classIds = new Set(schoolSections.map((s) => s.classId));
    return classes.filter((c) => classIds.has(c.id)).sort((a, b) => a.level - b.level);
  }, [schoolId]);

  const classOptions = useMemo(() => 
    schoolClasses.map((cls) => ({ id: cls.id, name: cls.name })),
    [schoolClasses]
  );

  const sectionOptions = useMemo(() => {
    if (!formData.classId) return [];
    return sections
      .filter(
        (section) =>
          section.schoolId === schoolId &&
          section.classId === formData.classId &&
          section.academicYearId === CURRENT_ACADEMIC_YEAR_ID
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((section) => ({ id: section.id, name: section.name }));
  }, [schoolId, formData.classId]);

  const studentOptions = useMemo(() => {
    if (!formData.sectionId) return [];
    
    const activeEnrollments = enrollments.filter(
      (e) =>
        e.schoolId === schoolId &&
        e.sectionId === formData.sectionId &&
        e.academicYearId === CURRENT_ACADEMIC_YEAR_ID &&
        e.status === "active"
    );
    
    const enrolledStudentIds = new Set(activeEnrollments.map((e) => e.studentId));
    
    return students
      .filter((student) => enrolledStudentIds.has(student.id))
      .sort((a, b) => a.fullName.localeCompare(b.fullName))
      .map((student) => ({ id: student.id, name: student.fullName }));
  }, [schoolId, formData.sectionId]);

  const activeViolationTypes = useMemo(() => 
    violationTypes
      .filter((vt) => vt.points < 0)
      .map((vt) => ({ id: vt.id, name: vt.name, points: vt.points }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const periodOptions = useMemo(() => 
    periods
      .filter((p) => {
        const num = parseInt(p.id.replace("period-", ""), 10);
        return num >= 1 && num <= 7;
      })
      .map((p) => ({ id: p.id, name: p.name })),
    []
  );

  const subjectOptions = useMemo(() => {
    if (!formData.sectionId) return [];
    
    const assignmentsForSection = teacherAssignments.filter(
      (a) =>
        a.schoolId === schoolId &&
        a.sectionId === formData.sectionId &&
        a.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );
    
    const subjectIds = new Set(assignmentsForSection.map((a) => a.subjectId));
    
    return subjects
      .filter((s) => subjectIds.has(s.id))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((subject) => ({ id: subject.id, name: subject.name }));
  }, [schoolId, formData.sectionId]);

  const teacherOptions = useMemo(() => {
    if (!formData.sectionId || !formData.subjectId) return [];
    
    const assignmentsForSectionAndSubject = teacherAssignments.filter(
      (a) =>
        a.schoolId === schoolId &&
        a.sectionId === formData.sectionId &&
        a.subjectId === formData.subjectId &&
        a.academicYearId === CURRENT_ACADEMIC_YEAR_ID
    );
    
    const teacherIds = new Set(assignmentsForSectionAndSubject.map((a) => a.teacherId));
    
    return teachers
      .filter((t) => teacherIds.has(t.id) && t.schoolId === schoolId)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((teacher) => ({ id: teacher.id, name: teacher.name }));
  }, [schoolId, formData.sectionId, formData.subjectId]);

  const selectedViolationType = useMemo(() => 
    activeViolationTypes.find((vt) => vt.id === formData.violationTypeId),
    [activeViolationTypes, formData.violationTypeId]
  );

  const validateDate = (dateStr: string): string | null => {
    if (!dateStr) return "التاريخ مطلوب";
    if (dateStr > today) return "لا يمكن اختيار تاريخ مستقبلي";
    if (dateStr < minDateStr) return `لا يمكن اختيار تاريخ أقدم من ${MAX_DATE_AGE_DAYS} يوماً`;
    return null;
  };

  const validateForm = (): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    const dateError = validateDate(formData.date);
    if (dateError) newErrors.date = dateError;
    
    if (!formData.classId) newErrors.classId = "الصف مطلوب";
    if (!formData.sectionId) newErrors.sectionId = "الشعبة مطلوبة";
    if (!formData.studentId) newErrors.studentId = "الطالب مطلوب";
    if (!formData.violationTypeId) newErrors.violationTypeId = "نوع المخالفة مطلوب";
    if (!formData.periodId) newErrors.periodId = "الحصة مطلوبة";
    if (!formData.subjectId) newErrors.subjectId = "المادة مطلوبة";
    if (!formData.teacherId) newErrors.teacherId = "المعلم مطلوب";
    
    return newErrors;
  };

  const handleFieldChange = <K extends keyof ViolationFormData>(field: K, value: ViolationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    
    if (field === "classId") {
      setFormData((prev) => ({ ...prev, sectionId: null, studentId: null, subjectId: null, teacherId: null }));
    } else if (field === "sectionId") {
      setFormData((prev) => ({ ...prev, studentId: null, subjectId: null, teacherId: null }));
    } else if (field === "subjectId") {
      setFormData((prev) => ({ ...prev, teacherId: null }));
    }
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newViolation = {
      id: `violation-${Date.now()}`,
      studentId: formData.studentId!,
      schoolId,
      violationTypeId: formData.violationTypeId!,
      points: selectedViolationType?.points ?? 0,
      teacherId: formData.teacherId!,
      periodId: formData.periodId!,
      date: formData.date,
      subjectId: formData.subjectId!,
      notes: formData.notes,
      recordedBy: identity.username,
    };
    
    console.log("Saved violation:", newViolation);
    
    addSessionActivity({
      type: "violation_recorded",
      title: selectedViolationType?.name ?? "مخالفة",
      message: `تم تسجيل مخالفة للطالب ${students.find(s => s.id === formData.studentId)?.fullName} (${Math.abs(selectedViolationType?.points ?? 0)} نقطة)`,
      studentId: formData.studentId ?? undefined,
      studentName: students.find(s => s.id === formData.studentId)?.fullName,
    });
    
    setSaveSuccess(true);
    setIsSubmitting(false);
    
    setTimeout(() => {
      setFormData({
        date: today,
        classId: null,
        sectionId: null,
        studentId: null,
        violationTypeId: null,
        periodId: null,
        subjectId: null,
        teacherId: null,
        notes: "",
      });
      setSaveSuccess(false);
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      date: today,
      classId: null,
      sectionId: null,
      studentId: null,
      violationTypeId: null,
      periodId: null,
      subjectId: null,
      teacherId: null,
      notes: "",
    });
    setErrors({});
    setSaveSuccess(false);
  };

  const inputClass = "h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20";
  const inputErrorClass = "h-11 w-full rounded-xl border border-[var(--danger)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20";
  const labelClass = "mb-2 block text-sm font-medium text-[var(--text-primary)]";
  const errorClass = "mt-1 text-xs text-[var(--danger)]";
  const sectionClass = "rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]";
  const disabledClass = "opacity-50 pointer-events-none";

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            تسجيل مخالفة
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            تسجيل مخالفة جديدة
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            املأ الحقول بالترتيب. الحقول اللاحقة تظهر بعد اختيار ما يسبقها.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-[var(--success-light)] px-4 py-3 text-sm font-semibold text-[var(--success)] flex items-center justify-between">
          <span>تم حفظ المخالفة بنجاح ✓</span>
          <button
            type="button"
            onClick={() => setSaveSuccess(false)}
            className="text-[var(--success)] hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Step 1: Date */}
        <div className={`${sectionClass} p-5`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
              1
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">التاريخ</h3>
          </div>

          <div>
            <label htmlFor="violation-date" className={labelClass}>
              تاريخ المخالفة
            </label>
            <input
              id="violation-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleFieldChange("date", e.target.value)}
              max={today}
              min={minDateStr}
              className={errors.date ? inputErrorClass : inputClass}
            />
            {errors.date && <p className={errorClass}>{errors.date}</p>}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              الفترة المسموحة: {minDateStr} إلى {today}
            </p>
          </div>
        </div>

        {/* Step 2: Class */}
        <div className={`${sectionClass} p-5 ${!formData.date || errors.date ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.classId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              2
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">الصف</h3>
          </div>

          <div>
            <label htmlFor="violation-class" className={labelClass}>
              اختر الصف
            </label>
            <select
              id="violation-class"
              value={formData.classId ?? ""}
              onChange={(e) => handleFieldChange("classId", e.target.value || null)}
              disabled={Boolean(!formData.date || errors.date)}
              className={inputClass}
            >
              <option value="">اختر الصف</option>
              {classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            {errors.classId && <p className={errorClass}>{errors.classId}</p>}
          </div>
        </div>

        {/* Step 3: Section */}
        <div className={`${sectionClass} p-5 ${!formData.classId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.sectionId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              3
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">الشعبة</h3>
          </div>

          <div>
            <label htmlFor="violation-section" className={labelClass}>
              اختر الشعبة
            </label>
            <select
              id="violation-section"
              value={formData.sectionId ?? ""}
              onChange={(e) => handleFieldChange("sectionId", e.target.value || null)}
              disabled={!formData.classId}
              className={inputClass}
            >
              <option value="">اختر الشعبة</option>
              {sectionOptions.map((section) => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
            {sectionOptions.length === 0 && formData.classId && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا توجد شعب متاحة لهذا الصف في السنة الدراسية الحالية</p>
            )}
            {errors.sectionId && <p className={errorClass}>{errors.sectionId}</p>}
          </div>
        </div>

        {/* Step 4: Student */}
        <div className={`${sectionClass} p-5 ${!formData.sectionId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.studentId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              4
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">الطالب</h3>
          </div>

          <div>
            <label htmlFor="violation-student" className={labelClass}>
              اختر الطالب
            </label>
            <select
              id="violation-student"
              value={formData.studentId ?? ""}
              onChange={(e) => handleFieldChange("studentId", e.target.value || null)}
              disabled={!formData.sectionId}
              className={inputClass}
            >
              <option value="">اختر الطالب</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
            {studentOptions.length === 0 && formData.sectionId && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا يوجد طلاب مسجلون في هذه الشعبة للسنة الدراسية الحالية</p>
            )}
            {errors.studentId && <p className={errorClass}>{errors.studentId}</p>}
          </div>
        </div>

        {/* Step 5: Violation Type */}
        <div className={`${sectionClass} p-5 ${!formData.studentId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.violationTypeId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              5
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">نوع المخالفة</h3>
          </div>

          <div>
            <label htmlFor="violation-type" className={labelClass}>
              اختر نوع المخالفة
            </label>
            <select
              id="violation-type"
              value={formData.violationTypeId ?? ""}
              onChange={(e) => handleFieldChange("violationTypeId", e.target.value || null)}
              disabled={!formData.studentId}
              className={inputClass}
            >
              <option value="">اختر نوع المخالفة</option>
              {activeViolationTypes.map((vt) => (
                <option key={vt.id} value={vt.id}>{vt.name} ({Math.abs(vt.points)} نقطة)</option>
              ))}
            </select>
            {errors.violationTypeId && <p className={errorClass}>{errors.violationTypeId}</p>}
          </div>

          {selectedViolationType && (
            <div className="mt-4 p-3 rounded-xl bg-[var(--danger-light)] border border-[var(--danger)]/20">
              <p className="text-sm font-medium text-[var(--danger)]">
                النقاط المخصومة: <span className="font-bold">{Math.abs(selectedViolationType.points)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Step 6: Period */}
        <div className={`${sectionClass} p-5 ${!formData.violationTypeId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.periodId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              6
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">الحصة</h3>
          </div>

          <div>
            <label htmlFor="violation-period" className={labelClass}>
              اختر الحصة
            </label>
            <select
              id="violation-period"
              value={formData.periodId ?? ""}
              onChange={(e) => handleFieldChange("periodId", e.target.value || null)}
              disabled={!formData.violationTypeId}
              className={inputClass}
            >
              <option value="">اختر الحصة</option>
              {periodOptions.map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
            {errors.periodId && <p className={errorClass}>{errors.periodId}</p>}
          </div>
        </div>

        {/* Step 7: Subject */}
        <div className={`${sectionClass} p-5 ${!formData.sectionId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.subjectId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              7
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">المادة</h3>
          </div>

          <div>
            <label htmlFor="violation-subject" className={labelClass}>
              اختر المادة
            </label>
            <select
              id="violation-subject"
              value={formData.subjectId ?? ""}
              onChange={(e) => handleFieldChange("subjectId", e.target.value || null)}
              disabled={!formData.sectionId}
              className={inputClass}
            >
              <option value="">اختر المادة</option>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            {subjectOptions.length === 0 && formData.sectionId && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا توجد مواد مسندة لهذه الشعبة</p>
            )}
            {errors.subjectId && <p className={errorClass}>{errors.subjectId}</p>}
          </div>
        </div>

        {/* Step 8: Teacher */}
        <div className={`${sectionClass} p-5 ${!formData.subjectId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              formData.teacherId ? "bg-[var(--success-light)] text-[var(--success)]" : "bg-[var(--brand-primary-light)] text-[var(--brand-primary)]"
            }`}>
              8
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">المعلم</h3>
          </div>

          <div>
            <label htmlFor="violation-teacher" className={labelClass}>
              اختر المعلم
            </label>
            <select
              id="violation-teacher"
              value={formData.teacherId ?? ""}
              onChange={(e) => handleFieldChange("teacherId", e.target.value || null)}
              disabled={!formData.subjectId}
              className={inputClass}
            >
              <option value="">اختر المعلم</option>
              {teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
            {teacherOptions.length === 0 && formData.subjectId && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا يوجد معلمون مسندون لهذه المادة في هذه الشعبة</p>
            )}
            {errors.teacherId && <p className={errorClass}>{errors.teacherId}</p>}
          </div>
        </div>

        {/* Step 9: Notes */}
        <div className={`${sectionClass} p-5 ${!formData.teacherId ? disabledClass : ""}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-[var(--brand-primary)]`}>
              9
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">ملاحظات (اختياري)</h3>
          </div>

          <div>
            <label htmlFor="violation-notes" className={labelClass}>
              ملاحظات إضافية
            </label>
            <textarea
              id="violation-notes"
              value={formData.notes}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              disabled={!formData.teacherId}
              rows={3}
              placeholder="أي ملاحظات إضافية حول المخالفة..."
              className={`${inputClass} resize-y min-h-[80px]`}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className={`${sectionClass} p-5 ${!formData.teacherId ? disabledClass : ""}`}>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !formData.teacherId}
            className="w-full h-12 rounded-xl bg-[var(--brand-navy)] text-white font-semibold text-base shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ المخالفة"}
          </button>
          
          <button
            type="button"
            onClick={resetForm}
            className="mt-3 w-full h-11 rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            مسح النموذج
          </button>
        </div>
      </div>
    </section>
  );
}