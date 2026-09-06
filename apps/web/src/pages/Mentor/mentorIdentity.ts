import { schools } from "@shared/data/mockData";

export type MentorIdentity = {
  username: string;
  schoolId: string;
};

const SESSION_STORAGE_KEY = "alghassania_mentor_identity";

export const MENTOR_ACCOUNTS = schools.map((school, index) => ({
  username: `mentor${index + 1}`,
  schoolId: school.id,
  password: "mentor123",
}));

function createIdentity(username: string, schoolId: string): MentorIdentity {
  return { username, schoolId };
}

export function resolveAccountByUsername(
  username: string
): MentorIdentity | null {
  const normalized = username.trim().toLowerCase();
  const account = MENTOR_ACCOUNTS.find(
    (item) => item.username === normalized
  );

  if (!account) {
    return null;
  }

  return createIdentity(account.username, account.schoolId);
}

export function setCurrentMentor(identity: MentorIdentity) {
  try {
    window.sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(identity)
    );
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

export function readCurrentMentor(): MentorIdentity | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MentorIdentity) : null;
  } catch {
    return null;
  }
}

export function clearCurrentMentor() {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // تجاهل أخطاء التخزين أثناء الجلسة
  }
}

export function defaultMentorIdentity(): MentorIdentity {
  return createIdentity(MENTOR_ACCOUNTS[0].username, MENTOR_ACCOUNTS[0].schoolId);
}