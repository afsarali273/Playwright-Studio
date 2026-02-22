/**
 * Zustand store: Logs
 * Maintains a rolling list of log entries from all sources.
 */
import type { LogEntry } from '../../shared/types';
interface LogsState {
    logs: LogEntry[];
    addLog: (entry: LogEntry) => void;
    clearLogs: () => void;
}
export declare const useLogsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<LogsState>>;
export {};
//# sourceMappingURL=logs-store.d.ts.map