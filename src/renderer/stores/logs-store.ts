/**
 * Zustand store: Logs
 * Maintains a rolling list of log entries from all sources.
 */

import { create } from 'zustand';
import type { LogEntry } from '../../shared/types';

const MAX_LOGS = 500;

interface LogsState {
  logs: LogEntry[];
  addLog: (entry: LogEntry) => void;
  clearLogs: () => void;
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],

  addLog: (entry) =>
    set((state) => ({
      logs: [...state.logs, entry].slice(-MAX_LOGS),
    })),

  clearLogs: () => set({ logs: [] }),
}));
