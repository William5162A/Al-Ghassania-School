import { useAdminContext } from "./adminContext";

export function AdminSettingsPage() {
  const { identity, schoolName } = useAdminContext();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
          الإعدادات
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
          إعدادات الحساب
        </h1>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          إعدادات الحساب الخاص بمدرسة "{schoolName}". لا توجد إدارة حسابات مدراء آخرين أو الإعدادات العامة في النظام.
        </p>
      </div>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-sm)]">
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          إدارة كلمات مرور المدراء تتم عبر حساب المالك فقط. لا يمكن للمدير تغيير كلمة مروره ذاتياً.
        </p>
      </section>

      {/* My account */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--card-border)] p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            الحساب
          </h2>

          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            بيانات حساب مدير المدرسة الحالي
          </p>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-lg font-bold text-[var(--brand-navy)]">
              {identity.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {identity.username}
              </p>

              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {schoolName}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[var(--success-light)] px-2.5 py-1 text-xs font-semibold text-[var(--success)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
            نشط
          </span>
        </div>
      </section>

      {/* Scoped settings placeholder */}
      <section className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--card-background)] p-6 shadow-[var(--shadow-sm)]">
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          إعدادات إضافية خاصة بالمدرسة
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          ستتوفر إعدادات خاصة بمدرستك هنا (مثل التفضيلات والتخصيصات) في مرحلة لاحقة. لا توجد حالياً تعديل الإعدادات العامة أو حسابات المدارس الأخرى.
        </p>
      </section>
    </section>
  );
}