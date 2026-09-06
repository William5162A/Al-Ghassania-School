import { students, violations, GUARDIAN_CALL_THRESHOLD, isGuardianCallRequired } from "@shared/data/mockData";
import { addSessionActivity } from "./sessionActivity";

export type GuardianNotificationEvent =
  | "guardian_call_required"
  | "guardian_call_made";

export type OwnerNotification = {
  id: string;
  key?: string;
  studentId: string;
  studentName: string;
  event: GuardianNotificationEvent;
  callsCount: number;
  threshold?: number;
  message: string;
  createdAt: number;
  read: boolean;
};

const NOTIFICATIONS_STORAGE_KEY = "alghassania_owner_notifications";
const MAX_NOTIFICATIONS = 50;

const listeners = new Set<() => void>();

export function readNotifications(): OwnerNotification[] {
  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OwnerNotification[]) : [];
  } catch {
    return [];
  }
}

function writeNotifications(list: OwnerNotification[]) {
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

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function addNotification(
  notification: Omit<OwnerNotification, "id" | "createdAt" | "read">
) {
  const full: OwnerNotification = {
    ...notification,
    id: createId("notif"),
    createdAt: Date.now(),
    read: false,
  };

  const next = [full, ...readNotifications()].slice(0, MAX_NOTIFICATIONS);
  writeNotifications(next);
  emitChange();
}

export function markNotificationRead(id: string) {
  const next = readNotifications().map((notification) =>
    notification.id === id ? { ...notification, read: true } : notification
  );

  writeNotifications(next);
  emitChange();
}

export function markAllNotificationsRead() {
  const next = readNotifications().map((notification) => ({
    ...notification,
    read: true,
  }));

  writeNotifications(next);
  emitChange();
}

export function syncGuardianNotifications(
  countsByStudent: Record<string, number>
) {
  const existing = readNotifications();
  const existingKeys = new Set(
    existing.filter((notification) => notification.key).map((n) => n.key)
  );

  let added = false;

  students.forEach((student) => {
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

export function notifyGuardianCallMade(
  studentId: string,
  studentName: string,
  newCount: number,
  countsByStudent: Record<string, number>
) {
  addNotification({
    studentId,
    studentName,
    event: "guardian_call_made",
    callsCount: newCount,
    message: `تم تسجيل استدعاء ولي الأمر للطالب ${studentName} (الاتصال رقم ${newCount}).`,
  });

  syncGuardianNotifications(countsByStudent);
}