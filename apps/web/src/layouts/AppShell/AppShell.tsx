import { useState } from "react";
import { Outlet } from "react-router";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { ScrollToTop } from "@/components/ScrollToTop";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <ScrollToTop containerSelector="main.flex-1" />
      <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
        <AppHeader
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((open) => !open)}
        />

        <div className="relative flex min-h-0 flex-1">
          <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="min-w-0 flex-1 p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
