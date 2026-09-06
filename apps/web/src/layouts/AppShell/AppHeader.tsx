type AppHeaderProps = {
  sidebarOpen: boolean;
  onMenuClick: () => void;
};

export function AppHeader({ sidebarOpen, onMenuClick }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4">
      <button
        type="button"
        className="rounded border border-neutral-300 px-3 py-1 text-sm md:hidden"
        aria-expanded={sidebarOpen}
        aria-controls="app-sidebar"
        onClick={onMenuClick}
      >
        القائمة
      </button>
      <p className="text-sm font-medium">مدرسة الغسانية</p>
    </header>
  );
}
