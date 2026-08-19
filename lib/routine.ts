export interface RoutineContext {
  raw: string;
  savedAt: string;
}

const ROUTINE_KEY = "bareiq_routine";

export function getRoutineContext(): RoutineContext | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(ROUTINE_KEY);
  return stored ? (JSON.parse(stored) as RoutineContext) : null;
}

export function saveRoutineContext(raw: string) {
  const routine = { raw: raw.trim(), savedAt: new Date().toISOString() };
  window.localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  return routine;
}

export function clearRoutineContext() {
  if (typeof window !== "undefined") window.localStorage.removeItem(ROUTINE_KEY);
}
