import { schools } from "@shared/data/mockData";

export type AdminIdentity = {
  username: string;
  schoolId: string;
};

const SESSION_STORAGE_KEY = "alghassania_admin_identity";

export const ADMIN_ACCOUNTS = schools.map((school, index) => ({
  username: `admin${index + 1}`,
  schoolId: school.id,
  password: "admin123",
}));

function createIdentity(username: string, schoolId: string): AdminIdentity {
  return { username, schoolId };
}

export function resolveAccountByUsername(
  username: string
): AdminIdentity | null {
  const normalized = username.trim().toLowerCase();
  const account = ADMIN_ACCOUNTS.find(
    (item) => item.username === normalized
  );

  if (!account) {
    return null;
  }

  return createIdentity(account.username, account.schoolId);
}

export function setCurrentAdmin(identity: AdminIdentity) {
  try {
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(identity)
    );
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

export function readCurrentAdmin(): AdminIdentity | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminIdentity) : null;
  } catch {
    return null;
  }
}

export function clearCurrentAdmin() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

export function defaultAdminIdentity(): AdminIdentity {
  return createIdentity(ADMIN_ACCOUNTS[0].username, ADMIN_ACCOUNTS[0].schoolId);
}
