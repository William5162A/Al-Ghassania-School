import { useLocation, useNavigate } from "react-router";
import { academicYears, CURRENT_ACADEMIC_YEAR_ID } from "@shared/data/mockData";

type OwnerSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const navigation = [
  { id: "overview", label: "نظرة عامة", icon: "⌂", path: "/owner" },
  { id: "schools", label: "المدارس", icon: "▦", path: "/owner/schools" },
  { id: "students", label: "الطلاب", icon: "♙", path: "/owner/students" },
  { id: "violations", label: "المخالفات", icon: "!", path: "/owner/violations" },
  { id: "reports", label: "التقارير", icon: "▤", path: "/owner/reports" },
  { id: "activity", label: "سجل الموقع", icon: "◷", path: "/owner/activity" },
  { id: "settings", label: "الإعدادات", icon: "⚙️", path: "/owner/settings" },
];

export function OwnerSidebar({
  isOpen,
  onClose,
}: OwnerSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentAcademicYear = academicYears.find((ay) => ay.id === CURRENT_ACADEMIC_YEAR_ID);

  function isActive(path: string) {
    if (path === "/owner") {
      return location.pathname === "/owner";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  function handleNavigation(path: string) {
    navigate(path);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[var(--brand-navy-dark)]/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-72 flex-col bg-[var(--sidebar-background)] text-[var(--sidebar-text)] shadow-[var(--shadow-lg)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <img
            src="/school-logo.png"
            alt="شعار مدارس الغسانية"
            className="h-12 w-12 object-contain"
          />

          <div>
            <p className="text-sm font-bold">
              مدارس الغسانية
            </p>

            <p className="mt-0.5 text-xs text-[var(--sidebar-text-muted)]">
              نظام إدارة المدارس
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            className="mr-auto flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white lg:hidden"
          >
            ×
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navigation.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[var(--sidebar-active)] text-white shadow-sm"
                    : "text-[var(--sidebar-text-muted)] hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-[var(--sidebar-text-muted)]">
              الحساب الحالي
            </p>

            <p className="mt-1 text-sm font-semibold">
              المالك
            </p>

            {currentAcademicYear && (
              <p className="mt-2 text-xs font-medium text-[var(--accent-gold)]">
                السنة الدراسية: {currentAcademicYear.label}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}