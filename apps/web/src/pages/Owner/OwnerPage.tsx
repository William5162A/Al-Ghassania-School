import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router";
import { OwnerHeader } from "./components/OwnerHeader";
import { OwnerSidebar } from "./components/OwnerSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  markAllNotificationsRead,
  markNotificationRead,
  readNotifications,
  subscribeNotifications,
  syncGuardianNotifications,
} from "./notifications";
import type { OwnerNotification } from "./notifications";

const GUARDIAN_CALLS_STORAGE_KEY = "alghassania_guardian_calls";

function readRecordedCalls(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(GUARDIAN_CALLS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function OwnerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<OwnerNotification[]>(
    () => readNotifications()
  );

  useEffect(() => {
    const refresh = () => {
      syncGuardianNotifications(readRecordedCalls());
      setNotifications(readNotifications());
    };

    const unsubscribe = subscribeNotifications(refresh);
    refresh();

    return unsubscribe;
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    markNotificationRead(id);
    setNotifications(readNotifications());
  }, []);

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead();
    setNotifications(readNotifications());
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  return (
    <>
      <ScrollToTop containerSelector="main.mx-auto" />
      <div
        dir="rtl"
        className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
      >
        <div className="flex min-h-screen">
          <OwnerSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="min-w-0 flex-1">
            <OwnerHeader
              onMenuClick={() => setSidebarOpen(true)}
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
            />

            <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}