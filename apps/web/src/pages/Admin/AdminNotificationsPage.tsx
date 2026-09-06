import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAdminContext } from "./adminContext";
import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  readAdminNotifications,
  subscribeAdminNotifications,
} from "./adminNotifications";
import type { AdminNotification, AdminNotificationEvent } from "./adminNotifications";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationRoute(notification: AdminNotification): string {
  if (
    notification.event === "transfer_request" ||
    notification.event === "transfer_accepted" ||
    notification.event === "transfer_rejected"
  ) {
    return "/admin/transfer";
  }
  return `/admin/students/${notification.studentId}`;
}

function getNotificationIcon(event: AdminNotificationEvent) {
  switch (event) {
    case "guardian_call_made":
      return "📞";
    case "transfer_request":
      return "⇄";
    case "transfer_accepted":
      return "✓";
    case "transfer_rejected":
      return "✕";
    default:
      return "⚠️";
  }
}

function getNotificationIconClass(event: AdminNotificationEvent) {
  switch (event) {
    case "guardian_call_made":
      return "bg-[var(--success-light)] text-[var(--success)]";
    case "transfer_accepted":
      return "bg-[var(--success-light)] text-[var(--success)]";
    case "transfer_rejected":
      return "bg-[var(--danger-light)] text-[var(--danger)]";
    case "transfer_request":
      return "bg-[var(--warning-light)] text-[var(--warning)]";
    default:
      return "bg-[var(--danger-light)] text-[var(--danger)]";
  }
}

export function AdminNotificationsPage() {
  const { schoolId } = useAdminContext();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AdminNotification[]>(
    () => readAdminNotifications(schoolId)
  );

  useEffect(() => {
    const refresh = () => setNotifications(readAdminNotifications(schoolId));
    const unsubscribe = subscribeAdminNotifications(refresh);
    refresh();
    return unsubscribe;
  }, [schoolId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const handleRead = (id: string) => {
    markAdminNotificationRead(id);
    setNotifications(readAdminNotifications(schoolId));
  };

  const handleReadAll = () => {
    markAllAdminNotificationsRead();
    setNotifications(readAdminNotifications(schoolId));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            الإشعارات
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            إشعارات المدرسة
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            الإشعارات المتعلقة بطلاب مدرستك فقط.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleReadAll}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
          >
            تحديد الكل مقروء
          </button>
        )}
      </div>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            الإشعارات
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {unreadCount > 0
              ? `${unreadCount} إشعار غير مقروء`
              : "لا توجد إشعارات غير مقروءة"}
          </p>
        </div>

        {notifications.length > 0 ? (
          <div className="divide-y divide-[var(--border-light)]">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => {
                  if (!notification.read) {
                    handleRead(notification.id);
                  }
                  navigate(getNotificationRoute(notification));
                }}
                className={`flex w-full items-start gap-3 p-4 text-right transition-colors hover:bg-[var(--surface-muted)] ${
                  notification.read ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${getNotificationIconClass(
                    notification.event
                  )}`}
                >
                  {getNotificationIcon(notification.event)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-[var(--text-primary)]">
                    {notification.studentName}
                  </span>

                  <span className="mt-0.5 block text-xs leading-5 text-[var(--text-secondary)]">
                    {notification.message}
                  </span>

                  <span className="mt-1 block text-[11px] text-[var(--text-muted)]">
                    {formatTime(notification.createdAt)}
                  </span>
                </span>

                {!notification.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--danger)]" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              لا توجد إشعارات
            </p>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              ستظهر هنا الإشعارات المتعلقة بطلاب مدرستك فقط.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}