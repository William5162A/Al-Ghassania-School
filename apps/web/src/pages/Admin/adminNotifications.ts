import { students, violations, schools, GUARDIAN_CALL_THRESHOLD, isGuardianCallRequired } from "@shared/data/mockData";
import { addSessionActivity } from "../Owner/sessionActivity";

export type AdminNotificationEvent =
  | "guardian_call_required"
  | "guardian_call_made"
  | "transfer_request"
  | "transfer_accepted"
  | "transfer_rejected";

export type AdminNotification = {
  id: string;
  key?: string;
  studentId: string;
  studentName: string;
  event: AdminNotificationEvent;
  callsCount?: number;
  threshold?: number;
  transferRequestId?: string;
  sourceSchoolId?: string;
  destinationSchoolId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

const NOTIFICATIONS_STORAGE_KEY = "alghassania_admin_notifications";
const MAX_NOTIFICATIONS = 50;

const listeners = new Set<() => void>();

export function readAdminNotifications(
  schoolId: string
): AdminNotification[] {
  try {
    const list = readAllNotifications();
    const schoolStudentIds = new Set(
      students
        .filter((student) => student.schoolId === schoolId)
        .map((student) => student.id)
    );

    return list.filter((notification) => {
      // Standard case: notification for a student in this school
      if (schoolStudentIds.has(notification.studentId)) {
        return true;
      }
      // Transfer notifications: include if this school is the destination (incoming request)
      // or the source (accepted/rejected response)
      if (
        (notification.event === "transfer_request" &&
          notification.destinationSchoolId === schoolId) ||
        ((notification.event === "transfer_accepted" ||
          notification.event === "transfer_rejected") &&
          notification.sourceSchoolId === schoolId)
      ) {
        return true;
      }
      return false;
    });
  } catch {
    return [];
  }
}

export function readAllNotifications(): AdminNotification[] {
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminNotification[]) : [];
  } catch {
    return [];
  }
}

function writeNotifications(list: AdminNotification[]) {
  try {
    window.localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(list.slice(0, MAX_NOTIFICATIONS))
    );
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeAdminNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addAdminNotification(
  notification: Omit<AdminNotification, "id" | "createdAt" | "read">
) {
  const full: AdminNotification = {
    ...notification,
    id: createId("notif"),
    createdAt: Date.now(),
    read: false,
  };

  const next = [full, ...readAllNotifications()].slice(0, MAX_NOTIFICATIONS);
  writeNotifications(next);
  emitChange();
}

export function markAdminNotificationRead(id: string) {
  const next = readAllNotifications().map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );

  writeNotifications(next);
  emitChange();
}

export function markAllAdminNotificationsRead() {
  const next = readAllNotifications().map((notification) => ({
    ...notification,
    read: true,
  }));

  writeNotifications(next);
  emitChange();
}

export function syncAdminGuardianNotifications(
  schoolId: string,
  countsByStudent: Record<string, number>
) {
  const existing = readAllNotifications();
  const existingKeys = new Set(
    existing.filter((notification) => notification.key).map((n) => n.key)
  );

  let added = false;

  students
    .filter((student) => student.schoolId === schoolId)
    .forEach((student) => {
      const count = countsByStudent[student.id] ?? 0;
      const requiresCall = isGuardianCallRequired(
        student.id,
        violations,
        [],
        GUARDIAN_CALL_THRESHOLD
      );

      if (requiresCall) {
        const key = `${student.id}:threshold:${count}`;

        if (!existingKeys.has(key)) {
          existing.push({
            id: createId("notif"),
            key,
            studentId: student.id,
            studentName: student.fullName,
            event: "guardian_call_required",
            callsCount: count + 1,
            threshold: GUARDIAN_CALL_THRESHOLD * (count + 1),
            message: `بلغ الطالب ${student.fullName} حد استدعاء ولي الأمر (أقل من ${GUARDIAN_CALL_THRESHOLD * (count + 1)} نقطة).`,
            createdAt: Date.now(),
            read: false,
          });
          added = true;

          addSessionActivity({
            type: "guardian_call_required",
            title: student.fullName,
            message: `بلغ الطالب ${student.fullName} حد استدعاء ولي الأمر (أقل من ${GUARDIAN_CALL_THRESHOLD * (count + 1)} نقطة).`,
            studentId: student.id,
            studentName: student.fullName,
          });
        }
      }
    });

  if (added) {
    existing.sort((a, b) => b.createdAt - a.createdAt);
    writeNotifications(existing);
    emitChange();
  }
}

export function notifyAdminGuardianCallMade(
  schoolId: string,
  studentId: string,
  studentName: string,
  newCount: number,
  countsByStudent: Record<string, number>
) {
  addAdminNotification({
    studentId,
    studentName,
    event: "guardian_call_made",
    callsCount: newCount,
    message: `تم تسجيل استدعاء ولي الأمر للطالب ${studentName} (الاتصال رقم ${newCount}).`,
  });

  syncAdminGuardianNotifications(schoolId, countsByStudent);
}

export function notifyTransferRequestCreated(
  destinationSchoolId: string,
  studentId: string,
  studentName: string,
  sourceSchoolId: string,
  transferRequestId: string
) {
  const sourceSchool = schools.find((s) => s.id === sourceSchoolId);
  const sourceSchoolName = sourceSchool?.name ?? "مدرسة غير معروفة";

  addAdminNotification({
    studentId,
    studentName,
    event: "transfer_request",
    transferRequestId,
    sourceSchoolId,
    destinationSchoolId,
    message: `طلب نقل جديد للطالب ${studentName} من ${sourceSchoolName}.`,
  });
}

export function notifyTransferAccepted(
  sourceSchoolId: string,
  studentId: string,
  studentName: string,
  destinationSchoolId: string,
  transferRequestId: string
) {
  const destSchool = schools.find((s) => s.id === destinationSchoolId);
  const destSchoolName = destSchool?.name ?? "مدرسة غير معروفة";

  addAdminNotification({
    studentId,
    studentName,
    event: "transfer_accepted",
    transferRequestId,
    sourceSchoolId,
    destinationSchoolId,
    message: `تم قبول طلب نقل الطالب ${studentName} إلى ${destSchoolName}.`,
  });
}

export function notifyTransferRejected(
  sourceSchoolId: string,
  studentId: string,
  studentName: string,
  destinationSchoolId: string,
  transferRequestId: string
) {
  const destSchool = schools.find((s) => s.id === destinationSchoolId);
  const destSchoolName = destSchool?.name ?? "مدرسة غير معروفة";

  addAdminNotification({
    studentId,
    studentName,
    event: "transfer_rejected",
    transferRequestId,
    sourceSchoolId,
    destinationSchoolId,
    message: `تم رفض طلب نقل الطالب ${studentName} إلى ${destSchoolName}.`,
  });
}
