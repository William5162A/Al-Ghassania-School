import { useNavigate } from "react-router";
import { OwnerStats } from "./components/OwnerStats";
import { SchoolOverview } from "./components/SchoolOverview";
import { ActivityLog } from "./components/ActivityLog";

export function OwnerOverviewPage() {
  const navigate = useNavigate();

  return (  
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--brand-navy)] p-6 text-white shadow-[var(--shadow-md)] sm:p-8">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-gold)]/10 blur-2xl" />

        <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-[var(--brand-primary)]/20 blur-3xl" />

        <div className="relative">
          <p className="text-sm font-medium text-[var(--accent-gold)]">
            لوحة التحكم الرئيسية
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            أهلاً بك في نظام مدارس الغسانية
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            من هنا يمكنك متابعة المدارس والطلاب والمخالفات
            والعمليات التي تتم داخل النظام.
          </p>
        </div>
      </section>

      <OwnerStats />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)]">
        <SchoolOverview
          onSchoolSelect={(schoolId) =>
            navigate(`/owner/schools/${schoolId}`)
          }
        />

        <ActivityLog />
      </div>
    </div>
  );
}