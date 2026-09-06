import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { AdminNotification, AdminNotificationEvent } from "../adminNotifications";
import { useAdminContext } from "../adminContext";
import { academicYears, CURRENT_ACADEMIC_YEAR_ID } from "@shared/data/mockData";

type AdminHeaderProps = {
  onMenuClick: () => void;
  notifications: AdminNotification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
};

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

export function AdminHeader({
  onMenuClick,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: AdminHeaderProps) {
  const navigate = useNavigate();
  const { identity, schoolName } = useAdminContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentAcademicYear = academicYears.find((ay) => ay.id === CURRENT_ACADEMIC_YEAR_ID);

  useEffect(() => {
    if (!notificationsOpen) {
      return undefined;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, [notificationsOpen]);

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    setNotificationsOpen(false);
    navigate(getNotificationRoute(notification));
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-light)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="فتح القائمة"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-muted)] lg:hidden"
          >
            ☰
          </button>

          <div>
            <p className="text-xs font-medium text-[var(--accent-gold-dark)]">
              {schoolName}
            </p>

            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              لوحة المدير
            </h1>

            {currentAcademicYear && (
              <p className="mt-1 text-xs font-medium text-[var(--accent-gold)]">
                السنة الدراسية: {currentAcademicYear.label}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            ref={containerRef}
            className="relative flex items-center"
          >
            <button
              type="button"
              onClick={() => setNotificationsOpen((value) => !value)}
              aria-label="الإشعارات"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-lg text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--surface-muted)]"
            >
              🔔

              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--danger)] px-1 text-[11px] font-bold text-[var(--text-inverse)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute left-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-lg)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] p-4">
                  <div>
                    <h2 className="text-sm font-bold text-[var(--text-primary)]">
                      الإشعارات
                    </h2>

                    <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                      {unreadCount > 0
                        ? `${unreadCount} إشعار غير مقروء`
                        : "لا توجد إشعارات غير مقروءة"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto divide-y divide-[var(--border-light)]">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
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
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        لا توجد إشعارات
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        ستظهر هنا الإشعارات المتعلقة بطلاب مدرستك فقط.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-left">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {identity.username}
              </p>

              <p className="text-xs text-[var(--text-muted)]">
                مدير المدرسة
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-sm font-bold text-white">
              أ
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
