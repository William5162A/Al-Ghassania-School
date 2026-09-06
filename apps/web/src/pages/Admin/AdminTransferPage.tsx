import { useMemo, useState } from "react";
import { useAdminContext } from "./adminContext";
import {
  classes,
  students,
  schools,
  sections,
  enrollments,
  CURRENT_ACADEMIC_YEAR_ID,
  createTransferRequest,
  getOutgoingTransferRequests,
  getIncomingTransferRequests,
  acceptTransferRequest,
  rejectTransferRequest,
  TransferRequest,
  ViolationHistoryAction,
  TransferStatus,
  Section,
  Class,
} from "@shared/data/mockData";
import {
  notifyTransferRequestCreated,
  notifyTransferAccepted,
  notifyTransferRejected,
} from "./adminNotifications";

type StudentOption = {
  id: string;
  fullName: string;
  classId: string;
  sectionId: string;
};

function getStatusLabel(status: TransferStatus): string {
  switch (status) {
    case "pending":
      return "قيد المراجعة";
    case "accepted":
      return "مقبول";
    case "rejected":
      return "مرفوض";
    default:
      return status;
  }
}

function getStatusColor(status: TransferStatus): string {
  switch (status) {
    case "pending":
      return "bg-[var(--warning-light)] text-[var(--warning)]";
    case "accepted":
      return "bg-[var(--success-light)] text-[var(--success)]";
    case "rejected":
      return "bg-[var(--danger-light)] text-[var(--danger)]";
    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

function getViolationHistoryActionLabel(action: ViolationHistoryAction): string {
  return action === "move" ? "نقل سجل المخالفات" : "إعادة تعيين سجل المخالفات";
}

export function AdminTransferPage() {
  const { schoolId, schoolName, identity } = useAdminContext();
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [destinationSchoolId, setDestinationSchoolId] = useState("");
  const [violationHistoryAction, setViolationHistoryAction] = useState<ViolationHistoryAction>("move");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [acceptError, setAcceptError] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Classes available in this admin's school for current academic year (derived from sections)
  const availableClasses = useMemo((): Class[] => {
    const classIds = new Set(
      sections
        .filter((s) => s.schoolId === schoolId && s.academicYearId === CURRENT_ACADEMIC_YEAR_ID)
        .map((s) => s.classId)
    );
    return classes.filter((c) => classIds.has(c.id));
  }, [schoolId]);

  // Sections filtered by selected class and current academic year and admin's school
  const availableSections = useMemo((): Section[] => {
    if (!selectedClassId) return [];
    return sections.filter(
      (s) =>
        s.schoolId === schoolId &&
        s.academicYearId === CURRENT_ACADEMIC_YEAR_ID &&
        s.classId === selectedClassId
    );
  }, [schoolId, selectedClassId]);

  // Students filtered by admin's school, current academic year, selected class, selected section, active enrollment
  const availableStudents = useMemo((): StudentOption[] => {
    if (!selectedClassId || !selectedSectionId) return [];

    const sectionStudentIds = new Set(
      enrollments
        .filter(
          (e) =>
            e.schoolId === schoolId &&
            e.academicYearId === CURRENT_ACADEMIC_YEAR_ID &&
            e.classId === selectedClassId &&
            e.sectionId === selectedSectionId &&
            e.status === "active"
        )
        .map((e) => e.studentId)
    );

    return students
      .filter((s) => sectionStudentIds.has(s.id))
      .map((student) => ({
        id: student.id,
        fullName: student.fullName,
        classId: selectedClassId,
        sectionId: selectedSectionId,
      }));
  }, [schoolId, selectedClassId, selectedSectionId]);

  // Destination schools (excluding current school)
  const destinationSchools = useMemo(() => schools.filter((s) => s.id !== schoolId), [schoolId]);

  // Outgoing requests
  const outgoingRequests = useMemo(
    () => getOutgoingTransferRequests(schoolId),
    [schoolId, refreshKey]
  );

  // Incoming requests
  const incomingRequests = useMemo(
    () => getIncomingTransferRequests(schoolId),
    [schoolId, refreshKey]
  );

  const forceRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSectionId("");
    setSelectedStudentId("");
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedStudentId("");
  };

  const handleCreateRequest = () => {
    setFormError("");
    setFormSuccess("");

    if (!selectedStudentId) {
      setFormError("يرجى اختيار طالب");
      return;
    }
    if (!destinationSchoolId) {
      setFormError("يرجى اختيار المدرسة المستقبلة");
      return;
    }

    try {
      const newRequest = createTransferRequest(
        selectedStudentId,
        schoolId,
        destinationSchoolId,
        CURRENT_ACADEMIC_YEAR_ID,
        identity.username,
        violationHistoryAction,
        students,
        enrollments
      );
      // Notify destination school admin
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        notifyTransferRequestCreated(
          destinationSchoolId,
          student.id,
          student.fullName,
          schoolId,
          newRequest.id
        );
      }
      setFormSuccess("تم إنشاء طلب النقل بنجاح");
      setSelectedStudentId("");
      setDestinationSchoolId("");
      forceRefresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "فشل إنشاء طلب النقل");
    }
  };

  const handleAccept = (request: TransferRequest) => {
    setAcceptError("");
    try {
      acceptTransferRequest(
        request.id,
        identity.username,
        schoolId,
        enrollments,
        sections,
        CURRENT_ACADEMIC_YEAR_ID
      );
      // Notify source school admin
      const student = students.find((s) => s.id === request.studentId);
      if (student) {
        notifyTransferAccepted(
          request.sourceSchoolId,
          student.id,
          student.fullName,
          request.destinationSchoolId,
          request.id
        );
      }
      forceRefresh();
    } catch (error) {
      setAcceptError(error instanceof Error ? error.message : "فشل قبول طلب النقل");
    }
  };

  const handleReject = (request: TransferRequest) => {
    setRejectError("");
    try {
      rejectTransferRequest(
        request.id,
        identity.username,
        schoolId
      );
      // Notify source school admin
      const student = students.find((s) => s.id === request.studentId);
      if (student) {
        notifyTransferRejected(
          request.sourceSchoolId,
          student.id,
          student.fullName,
          request.destinationSchoolId,
          request.id
        );
      }
      forceRefresh();
    } catch (error) {
      setRejectError(error instanceof Error ? error.message : "فشل رفض طلب النقل");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
          نقل الطلاب
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          نقل الطلاب
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          إدارة طلبات نقل الطلاب بين المدارس. مدرستك: {schoolName}
        </p>
      </div>

      {/* Create Transfer Request */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-5 shadow-[var(--shadow-sm)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          إنشاء طلب نقل جديد
        </h2>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          المدرسة المرسلة: {schoolName} (ثابتة)
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="transfer-class" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              الصف
            </label>
            <select
              id="transfer-class"
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
            >
              <option value="">اختر صفاً</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <label htmlFor="transfer-section" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              الشعبة
            </label>
            <select
              id="transfer-section"
              value={selectedSectionId}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!selectedClassId}
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">اختر شعبة</option>
              {availableSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
            {!selectedClassId && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">اختر الصف أولاً</p>
            )}
            {selectedClassId && availableSections.length === 0 && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا توجد شعب متاحة لهذا الصف</p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="transfer-student" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              الطالب
            </label>
            <select
              id="transfer-student"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              disabled={!selectedClassId || !selectedSectionId}
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">اختر طالباً</option>
              {availableStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
            {(!selectedClassId || !selectedSectionId) && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">اختر الصف والشعبة أولاً</p>
            )}
            {selectedClassId && selectedSectionId && availableStudents.length === 0 && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">لا يوجد طلاب في هذه الشعبة للسنة الدراسية الحالية</p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="transfer-destination" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              المدرسة المستقبلة
            </label>
            <select
              id="transfer-destination"
              value={destinationSchoolId}
              onChange={(e) => setDestinationSchoolId(e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
            >
              <option value="">اختر مدرسة</option>
              {destinationSchools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label htmlFor="transfer-action" className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
              إجراء سجل المخالفات
            </label>
            <select
              id="transfer-action"
              value={violationHistoryAction}
              onChange={(e) => setViolationHistoryAction(e.target.value as ViolationHistoryAction)}
              className="h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20"
            >
              <option value="move">نقل سجل المخالفات</option>
              <option value="reset">إعادة تعيين سجل المخالفات</option>
            </select>
          </div>
        </div>

        {formError && (
          <div className="mt-4 rounded-xl bg-[var(--danger-light)] p-3 text-sm text-[var(--danger)]">
            {formError}
          </div>
        )}

        {formSuccess && (
          <div className="mt-4 rounded-xl bg-[var(--success-light)] p-3 text-sm text-[var(--success)]">
            {formSuccess}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleCreateRequest}
            disabled={!selectedStudentId || !destinationSchoolId}
            className="rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            إنشاء طلب النقل
          </button>
        </div>
      </section>

      {/* Outgoing Requests */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            طلبات النقل الصادرة
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            طلبات تم إنشاؤها من مدرستك ({schoolName})
          </p>
        </div>

        {outgoingRequests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد طلبات صادرة
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              لم تقم مدرستك بإنشاء أي طلبات نقل بعد.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {outgoingRequests.map((request) => {
              const student = students.find((s) => s.id === request.studentId);
              const destSchool = schools.find((s) => s.id === request.destinationSchoolId);
              return (
                <div key={request.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {student?.fullName ?? "طالب غير معروف"}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        إلى: {destSchool?.name ?? "مدرسة غير معروفة"} • الإجراء: {getViolationHistoryActionLabel(request.violationHistoryAction)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        تم الإنشاء: {new Date(request.requestedAt).toLocaleDateString("ar-SA")} بواسطة {request.requestedBy}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Incoming Requests */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            طلبات النقل الواردة
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            طلبات تنتظر مراجعة مدرستك ({schoolName})
          </p>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد طلبات واردة
            </p>
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              لا توجد طلبات نقل موجهة إلى مدرستك حالياً.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--card-border)]">
            {incomingRequests.map((request) => {
              const student = students.find((s) => s.id === request.studentId);
              const srcSchool = schools.find((s) => s.id === request.sourceSchoolId);
              const isPending = request.status === "pending";
              return (
                <div key={request.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-[var(--text-primary)]">
                        {student?.fullName ?? "طالب غير معروف"}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        من: {srcSchool?.name ?? "مدرسة غير معروفة"} • الإجراء: {getViolationHistoryActionLabel(request.violationHistoryAction)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        تم الإنشاء: {new Date(request.requestedAt).toLocaleDateString("ar-SA")} بواسطة {request.requestedBy}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </span>
                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleAccept(request)}
                            className="rounded-xl bg-[var(--success)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            قبول
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(request)}
                            className="rounded-xl bg-[var(--danger)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {(acceptError || rejectError) && (
                    <div className="mt-3 rounded-xl bg-[var(--danger-light)] p-3 text-sm text-[var(--danger)]">
                      {acceptError || rejectError}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}