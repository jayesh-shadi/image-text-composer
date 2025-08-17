import { HistoryState } from "./types";

const KEY = "image-text-composer-v1";

export function save(history: HistoryState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(history));
  } catch {}
}

export function load(): HistoryState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
