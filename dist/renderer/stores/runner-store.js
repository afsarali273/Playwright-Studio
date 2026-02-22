"use strict";
/**
 * Zustand store: Runner
 * Tracks execution status and progress.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRunnerStore = void 0;
const zustand_1 = require("zustand");
exports.useRunnerStore = (0, zustand_1.create)((set) => ({
    status: 'idle',
    currentStepId: null,
    progress: { completed: 0, total: 0 },
    setStatus: (status) => set({ status }),
    setCurrentStepId: (stepId) => set({ currentStepId: stepId }),
    setProgress: (progress) => set({ progress }),
    reset: () => set({
        status: 'idle',
        currentStepId: null,
        progress: { completed: 0, total: 0 },
    }),
}));
//# sourceMappingURL=runner-store.js.map