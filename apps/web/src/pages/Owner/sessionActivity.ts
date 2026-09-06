export type SessionActivityType =
  | "violation_recorded"
  | "guardian_call_made"
  | "guardian_call_required"
  | "violation_type_added"
  | "violation_type_points_edited"
  | "violation_points_edited"
  | "violation_point_deleted";

export type SessionActivityEntry = {
  id: string;
  type: SessionActivityType;
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  createdAt: number;
};

const MAX_SESSION_ACTIVITIES = 300;

let activities: SessionActivityEntry[] = [];

const listeners = new Set<() => void>();

export function readSessionActivities(): SessionActivityEntry[] {
  return [...activities].sort((a, b) => b.createdAt - a.createdAt);
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeSessionActivity(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function createId() {
  return `session-activity-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function addSessionActivity(
  entry: Omit<SessionActivityEntry, "id" | "createdAt">
) {
  activities = [
    { ...entry, id: createId(), createdAt: Date.now() },
    ...activities,
  ].slice(0, MAX_SESSION_ACTIVITIES);

  emitChange();
}