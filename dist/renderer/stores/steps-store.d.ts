/**
 * Zustand store: Test Steps
 * Manages the ordered list of test steps, selection, and CRUD operations.
 */
import type { TestStep, StepStatus } from '../../shared/types';
interface StepsState {
    /** Ordered list of all test steps */
    steps: TestStep[];
    /** Currently selected step ID */
    selectedStepId: string | null;
    /** Currently running step ID */
    activeStepId: string | null;
    setSteps: (steps: TestStep[]) => void;
    addStep: (step: TestStep) => void;
    updateStep: (stepId: string, updates: Partial<TestStep>) => void;
    deleteStep: (stepId: string) => void;
    reorderSteps: (orderedIds: string[]) => void;
    clearSteps: () => void;
    selectStep: (stepId: string | null) => void;
    setActiveStep: (stepId: string | null) => void;
    setStepStatus: (stepId: string, status: StepStatus, error?: string) => void;
    resetAllStatuses: () => void;
}
export declare const useStepsStore: import("zustand").UseBoundStore<import("zustand").StoreApi<StepsState>>;
export {};
//# sourceMappingURL=steps-store.d.ts.map