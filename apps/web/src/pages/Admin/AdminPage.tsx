import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { AdminHeader } from "./components/AdminHeader";
import { AdminSidebar } from "./components/AdminSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AdminPageContext, getSchoolName } from "./adminContext";
import { defaultAdminIdentity, readCurrentAdmin } from "./adminIdentity";
import {
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  readAdminNotifications,
  subscribeAdminNotifications,
  syncAdminGuardianNotifications,
} from "./adminNotifications";
import type { AdminNotification } from "./adminNotifications";

const GUARDIAN_CALLS_STORAGE_KEY = "alghassania_guardian_calls";

function readRecordedCalls(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(GUARDIAN_CALLS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export function AdminPage() {
  const identity = readCurrentAdmin() ?? defaultAdminIdentity();
  const schoolId = identity.schoolId;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(
    () => readAdminNotifications(schoolId)
  );

  useEffect(() => {
    const refresh = () => {
      syncAdminGuardianNotifications(schoolId, readRecordedCalls());
      setNotifications(readAdminNotifications(schoolId));
    };

    const unsubscribe = subscribeAdminNotifications(refresh);
    refresh();

    return unsubscribe;
  }, [schoolId]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markAdminNotificationRead(id);
      setNotifications(readAdminNotifications(schoolId));
    },
    [schoolId]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllAdminNotificationsRead();
    setNotifications(readAdminNotifications(schoolId));
  }, [schoolId]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const contextValue = useMemo(
    () => ({
      identity,
      schoolId,
      schoolName: getSchoolName(schoolId),
    }),
    [identity, schoolId]
  );

  if (!schoolId) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ScrollToTop containerSelector="main.mx-auto" />
      <AdminPageContext.Provider value={contextValue}>
        <div
          dir="rtl"
          className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]"
        >
          <div className="flex min-h-screen">
            <AdminSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            <div className="min-w-0 flex-1">
              <AdminHeader
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
      </AdminPageContext.Provider>
    </>
  );
}
