import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const errorId = id ? `${id}-error` : undefined;
    const helperId = id ? `${id}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={[
            "block w-full",
            "min-h-11",
            "rounded-[var(--radius-md)]",
            "border",
            "bg-[var(--surface)]",
            "px-3.5 py-2.5",
            "text-sm text-[var(--text-primary)]",
            "placeholder:text-[var(--text-muted)]",
            "outline-none",
            "transition-colors duration-150",
            error
              ? "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20"
              : "border-[var(--border)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/20",
            "disabled:cursor-not-allowed",
            "disabled:bg-[var(--surface-muted)]",
            "disabled:opacity-70",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-[var(--danger)]"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";