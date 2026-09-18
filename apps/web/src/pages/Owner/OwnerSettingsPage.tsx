import { useMemo, useState } from "react";
import { schools } from "@shared/data/mockData";

type AdminAccount = {
  id: string;
  schoolId: string;
  username: string;
  password: string;
};

const INITIAL_PASSWORD = "admin123";

const initialAccounts: AdminAccount[] = schools.map((school, index) => ({
  id: `admin-${school.id}`,
  schoolId: school.id,
  username: `admin${index + 1}`,
  password: INITIAL_PASSWORD,
}));

const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20";

function formatErrorMessage(message?: string) {
  return message ? (
    <p className="mt-1.5 text-xs text-[var(--danger)]">{message}</p>
  ) : null;
}

export function OwnerSettingsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    schoolId: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const [changeTarget, setChangeTarget] = useState<AdminAccount | null>(null);
  const [changeForm, setChangeForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [changeErrors, setChangeErrors] = useState<Record<string, string>>({});
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  const schoolName = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((school) => map.set(school.id, school.name));
    return (schoolId: string) => map.get(schoolId) ?? "غير محددة";
  }, []);

  const assignedSchoolIds = useMemo(
    () => new Set(accounts.map((account) => account.schoolId)),
    [accounts]
  );

  const usedUsernames = useMemo(
    () => new Set(accounts.map((account) => account.username)),
    [accounts]
  );

  const availableSchools = useMemo(
    () => schools.filter((school) => !assignedSchoolIds.has(school.id)),
    [assignedSchoolIds]
  );

  function openCreateForm() {
    setCreateForm({
      schoolId: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    setCreateErrors({});
    setCreateSuccess(null);
    setCreateOpen(true);
  }

  function validateCreate() {
    const errors: Record<string, string> = {};

    if (!createForm.schoolId) {
      errors.schoolId = "يرجى اختيار المدرسة";
    } else if (assignedSchoolIds.has(createForm.schoolId)) {
      errors.schoolId = "هذه المدرسة لديها حساب مدير بالفعل";
    }

    if (!createForm.username.trim()) {
      errors.username = "يرجى إدخال اسم المستخدم";
    } else if (usedUsernames.has(createForm.username.trim())) {
      errors.username = "اسم المستخدم موجود مسبقاً";
    }

    if (!createForm.password) {
      errors.password = "يرجى إدخال كلمة المرور";
    } else if (createForm.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`;
    }

    if (!createForm.confirmPassword) {
      errors.confirmPassword = "يرجى تأكيد كلمة المرور";
    } else if (createForm.confirmPassword !== createForm.password) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    return errors;
  }

  function handleSubmitCreate(event: React.FormEvent) {
    event.preventDefault();

    const errors = validateCreate();
    setCreateErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const newAccount: AdminAccount = {
      id: `admin-${Date.now()}`,
      schoolId: createForm.schoolId,
      username: createForm.username.trim(),
      password: createForm.password,
    };

    setAccounts((current) => [...current, newAccount]);
    setCreateSuccess(
      `تم إنشاء حساب "${newAccount.username}" للمدرسة "${schoolName(
        newAccount.schoolId
      )}" (تجريبي، لا يُحفظ على الخادم).`
    );

    setCreateForm({
      schoolId: "",
      username: "",
      password: "",
      confirmPassword: "",
    });
    setCreateOpen(false);
  }

  function handleUpdateCreate(
    field: keyof typeof createForm,
    value: string
  ) {
    if (createErrors[field]) {
      setCreateErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
    setCreateForm((current) => ({ ...current, [field]: value }));
  }

  function openChangePassword(account: AdminAccount) {
    setChangeTarget(account);
    setChangeForm({ password: "", confirmPassword: "" });
    setChangeErrors({});
    setChangeSuccess(null);
  }

  function validateChangePassword() {
    const errors: Record<string, string> = {};

    if (!changeForm.password) {
      errors.password = "يرجى إدخال كلمة المرور الجديدة";
    } else if (changeForm.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `كلمة المرور يجب ألا تقل عن ${MIN_PASSWORD_LENGTH} أحرف`;
    }

    if (!changeForm.confirmPassword) {
      errors.confirmPassword = "يرجى تأكيد كلمة المرور الجديدة";
    } else if (changeForm.confirmPassword !== changeForm.password) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
    }

    return errors;
  }

  function handleSubmitChangePassword(event: React.FormEvent) {
    event.preventDefault();

    if (!changeTarget) {
      return;
    }

    const errors = validateChangePassword();
    setChangeErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setAccounts((current) =>
      current.map((account) =>
        account.id === changeTarget.id
          ? { ...account, password: changeForm.password }
          : account
      )
    );

    setChangeSuccess(
      `تم تغيير كلمة المرور للحساب "${changeTarget.username}" (تجريبي، لا يُحفظ على الخادم).`
    );
    setChangeForm({ password: "", confirmPassword: "" });
  }

  function handleUpdateChange(
    field: keyof typeof changeForm,
    value: string
  ) {
    if (changeErrors[field]) {
      setChangeErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
    setChangeForm((current) => ({ ...current, [field]: value }));
  }

  function closeChangePassword() {
    setChangeTarget(null);
    setChangeForm({ password: "", confirmPassword: "" });
    setChangeErrors({});
    setChangeSuccess(null);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--accent-gold-dark)]">
            الإعدادات
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            حسابات مديري المدارس
          </h1>

          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            لكل مدرسة حساب مدير مرتبط بها. يمكنك مراجعة الحسابات وإدارة
            كلمات المرور من هنا.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] p-4 shadow-[var(--shadow-sm)]">
        <p className="text-xs leading-5 text-[var(--text-muted)]">
          إدارة الحسابات حالياً تجريبية ولا يتم حفظ التغييرات على الخادم.
          هذه الحسابات وهمية لأغراض العرض فقط وليست حسابات مصادقة فعلية.
        </p>
      </section>

      {/* Accounts list */}
      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 border-b border-[var(--card-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              الحسابات الحالية
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {accounts.length} حساب من أصل {schools.length} مدرسة
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-navy)] px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
          >
            <span>+</span>
            <span>إنشاء حساب مدير مدرسة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account, index) => (
            <article
              key={account.id}
              className="flex flex-col rounded-2xl border border-[var(--card-border)] p-5 transition-all duration-300 hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-primary-light)] text-lg font-bold text-[var(--brand-navy)]">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                    {schoolName(account.schoolId)}
                  </p>

                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--success-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--success)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    نشط
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-secondary)]">
                    اسم المستخدم
                  </dt>

                  <dd
                    dir="ltr"
                    className="font-mono font-semibold text-[var(--text-primary)]"
                  >
                    {account.username}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[var(--text-secondary)]">
                    كلمة المرور
                  </dt>

                  <dd
                    dir="ltr"
                    className="font-mono tracking-widest text-[var(--text-muted)]"
                    aria-label="كلمة المرور مخفية"
                  >
                    ••••••••••
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => openChangePassword(account)}
                className="mt-5 w-full rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
              >
                تغيير كلمة المرور
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Create account form */}
      {createOpen && (
        <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-sm)]">
          <div className="border-b border-[var(--card-border)] p-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              إنشاء حساب مدير مدرسة
            </h2>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {availableSchools.length > 0
                ? "اختر مدرسة ليس لديها حساب مدير بعد."
                : "جميع المدارس لديها حسابات مديرين بالفعل، ولا توجد مدارس غير مسندة."}
            </p>
          </div>

          <div className="p-5">
            {createSuccess && (
              <p className="mb-4 rounded-xl bg-[var(--success-light)] px-4 py-3 text-sm font-medium text-[var(--success)]">
                {createSuccess}
              </p>
            )}

            {availableSchools.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--card-border)] bg-[var(--surface-muted)] p-8 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  لا توجد مدارس غير مسندة متاحة
                </p>

                <p className="mt-2 text-xs leading-6 text-[var(--text-secondary)]">
                  جميع المدارس الخمس مسندة إليها حسابات مديرين بالفعل.
                  هذه الواجهة متاحة للاستخدام المستقبلي عند إضافة مدارس
                  جديدة.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitCreate}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="settings-create-school"
                      className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                    >
                      المدرسة
                    </label>

                    <select
                      id="settings-create-school"
                      value={createForm.schoolId}
                      onChange={(event) =>
                        handleUpdateCreate("schoolId", event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="">اختر المدرسة</option>

                      {availableSchools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>

                    {formatErrorMessage(createErrors.schoolId)}
                  </div>

                  <div>
                    <label
                      htmlFor="settings-create-username"
                      className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                    >
                      اسم المستخدم
                    </label>

                    <input
                      id="settings-create-username"
                      type="text"
                      dir="ltr"
                      value={createForm.username}
                      onChange={(event) =>
                        handleUpdateCreate("username", event.target.value)
                      }
                      placeholder="admin..."
                      className={inputClass}
                    />

                    {formatErrorMessage(createErrors.username)}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="settings-create-password"
                      className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                    >
                      كلمة المرور
                    </label>

                    <input
                      id="settings-create-password"
                      type="password"
                      dir="ltr"
                      value={createForm.password}
                      onChange={(event) =>
                        handleUpdateCreate("password", event.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputClass}
                    />

                    {formatErrorMessage(createErrors.password)}
                  </div>

                  <div>
                    <label
                      htmlFor="settings-create-confirm"
                      className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                    >
                      تأكيد كلمة المرور
                    </label>

                    <input
                      id="settings-create-confirm"
                      type="password"
                      dir="ltr"
                      value={createForm.confirmPassword}
                      onChange={(event) =>
                        handleUpdateCreate("confirmPassword", event.target.value)
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={inputClass}
                    />

                    {formatErrorMessage(createErrors.confirmPassword)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
                  >
                    إنشاء الحساب
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Change password modal */}
      {changeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="إغلاق"
            onClick={closeChangePassword}
            className="absolute inset-0 bg-[var(--brand-navy-dark)]/40 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-background)] shadow-[var(--shadow-lg)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--card-border)] p-5">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  تغيير كلمة المرور
                </h2>

                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {schoolName(changeTarget.schoolId)} —{" "}
                  <span dir="ltr" className="font-mono">
                    {changeTarget.username}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={closeChangePassword}
                aria-label="إغلاق"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-lg text-[var(--text-secondary)] transition hover:bg-[var(--border-light)]"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              {changeSuccess && (
                <p className="mb-4 rounded-xl bg-[var(--success-light)] px-4 py-3 text-sm font-medium text-[var(--success)]">
                  {changeSuccess}
                </p>
              )}

              <form
                onSubmit={handleSubmitChangePassword}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="settings-change-password"
                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                  >
                    كلمة المرور الجديدة
                  </label>

                  <input
                    id="settings-change-password"
                    type="password"
                    dir="ltr"
                    value={changeForm.password}
                    onChange={(event) =>
                      handleUpdateChange("password", event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={inputClass}
                  />

                  {formatErrorMessage(changeErrors.password)}
                </div>

                <div>
                  <label
                    htmlFor="settings-change-confirm"
                    className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                  >
                    تأكيد كلمة المرور الجديدة
                  </label>

                  <input
                    id="settings-change-confirm"
                    type="password"
                    dir="ltr"
                    value={changeForm.confirmPassword}
                    onChange={(event) =>
                      handleUpdateChange("confirmPassword", event.target.value)
                    }
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={inputClass}
                  />

                  {formatErrorMessage(changeErrors.confirmPassword)}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeChangePassword}
                    className="rounded-xl border border-[var(--card-border)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--border-light)]"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition hover:opacity-90"
                  >
                    حفظ كلمة المرور
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}