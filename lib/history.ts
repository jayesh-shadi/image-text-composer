import { EditorState, HistoryState } from "./types";

export function createInitialHistory(): HistoryState {
  const empty: EditorState = { layers: [], selectedIds: [] };
  return { past: [], present: empty, future: [] };
}

export function push(history: HistoryState, next: EditorState, limit = 50): HistoryState {
  const newPast = [...history.past, history.present].slice(-limit);
  return { past: newPast, present: next, future: [] };
}

export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  return { past: newPast, present: previous, future: [history.present, ...history.future] };
}

export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) return history;
  const next = history.future[0];
  const newFuture = history.future.slice(1);
  return { past: [...history.past, history.present], present: next, future: newFuture };
}
