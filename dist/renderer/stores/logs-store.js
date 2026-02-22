"use strict";
/**
 * Zustand store: Logs
 * Maintains a rolling list of log entries from all sources.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLogsStore = void 0;
const zustand_1 = require("zustand");
const MAX_LOGS = 500;
exports.useLogsStore = (0, zustand_1.create)((set) => ({
    logs: [],
    addLog: (entry) => set((state) => ({
        logs: [...state.logs, entry].slice(-MAX_LOGS),
    })),
    clearLogs: () => set({ logs: [] }),
}));
//# sourceMappingURL=logs-store.js.map