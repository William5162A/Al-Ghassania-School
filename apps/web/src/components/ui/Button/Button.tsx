import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-dark)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary-dark)]",
  danger:
    "bg-[var(--danger)] text-[var(--text-inverse)] hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-[var(--radius-md)]",
        "font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-[var(--brand-primary)]",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--background)]",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        // "disabled:hover:bg-inherit",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}