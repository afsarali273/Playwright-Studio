"use strict";
/**
 * Zustand store: Test Steps
 * Manages the ordered list of test steps, selection, and CRUD operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStepsStore = void 0;
const zustand_1 = require("zustand");
exports.useStepsStore = (0, zustand_1.create)((set) => ({
    steps: [],
    selectedStepId: null,
    activeStepId: null,
    setSteps: (steps) => set({ steps }),
    addStep: (step) => set((state) => ({
        steps: [...state.steps, step],
    })),
    updateStep: (stepId, updates) => set((state) => ({
        steps: state.steps.map((s) => s.id === stepId ? { ...s, ...updates } : s),
    })),
    deleteStep: (stepId) => set((state) => ({
        steps: state.steps.filter((s) => s.id !== stepId),
        selectedStepId: state.selectedStepId === stepId ? null : state.selectedStepId,
    })),
    reorderSteps: (orderedIds) => set((state) => {
        const stepMap = new Map(state.steps.map((s) => [s.id, s]));
        const reordered = orderedIds
            .map((id) => stepMap.get(id))
            .filter(Boolean);
        return { steps: reordered };
    }),
    clearSteps: () => set({ steps: [], selectedStepId: null, activeStepId: null }),
    selectStep: (stepId) => set({ selectedStepId: stepId }),
    setActiveStep: (stepId) => set({ activeStepId: stepId }),
    setStepStatus: (stepId, status, error) => set((state) => ({
        steps: state.steps.map((s) => s.id === stepId ? { ...s, status, error: error ?? s.error } : s),
    })),
    resetAllStatuses: () => set((state) => ({
        steps: state.steps.map((s) => ({
            ...s,
            status: 'idle',
            error: undefined,
        })),
    })),
}));
//# sourceMappingURL=steps-store.js.map