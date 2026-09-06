import { clearCurrentMentor } from "../mentorIdentity";
import { useNavigate } from "react-router";

type MentorHeaderProps = {
  identity: { username: string; schoolId: string };
  schoolName: string;
};

export function MentorHeader({ identity, schoolName }: MentorHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearCurrentMentor();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-16 items-center justify-between gap-4 border-b border-[var(--card-border)] bg-[var(--surface)] px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-[var(--brand-primary)]">
          ✎
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-muted)]">
            مدرسة: {schoolName}
          </p>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {identity.username}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-background)] text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--danger)]"
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
      >
        ←
      </button>
    </header>
  );
}