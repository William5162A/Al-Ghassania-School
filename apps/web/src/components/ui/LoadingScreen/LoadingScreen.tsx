interface LoadingScreenProps {
    message?: string;
  }
  
  export function LoadingScreen({
    message = "جاري تحميل النظام...",
  }: LoadingScreenProps) {
    return (
      <div
        className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--brand-navy-dark)]"
        role="status"
        aria-live="polite"
        aria-label={message}
      >
        <div className="flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/15 border-t-white" />
  
            <img
              src="/school-logo.png"
              alt=""
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>
  
          <p className="mt-5 text-sm font-medium text-white/85">
            {message}
          </p>
        </div>
      </div>
    );
  }