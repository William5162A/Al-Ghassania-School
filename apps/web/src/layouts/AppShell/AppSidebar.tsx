type AppSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const placeholderItems = ["العنصر الأول", "العنصر الثاني", "العنصر الثالث"];

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-neutral-900/30 md:hidden"
          aria-label="إغلاق القائمة"
          onClick={onClose}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 start-0 z-30 flex w-64 flex-col border-e border-neutral-200 bg-white transition-transform md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4 md:h-auto md:border-b-0 md:px-4 md:py-4">
          <p className="text-sm font-medium">القائمة</p>
          <button
            type="button"
            className="rounded border border-neutral-300 px-2 py-1 text-sm md:hidden"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="قائمة تجريبية">
          {placeholderItems.map((label) => (
            <span
              key={label}
              className="rounded px-3 py-2 text-sm text-neutral-700"
            >
              {label}
            </span>
          ))}
        </nav>
      </aside>
    </>
  );
}
