import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
  success:
    "bg-[var(--success-light)] text-[var(--success)]",
  warning:
    "bg-[var(--warning-light)] text-[var(--warning)]",
  danger:
    "bg-[var(--danger-light)] text-[var(--danger)]",
  info:
    "bg-[var(--info-light)] text-[var(--info)]",
};

export function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "rounded-full",
        "px-2.5 py-1",
        "text-xs font-medium",
        "leading-none",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}