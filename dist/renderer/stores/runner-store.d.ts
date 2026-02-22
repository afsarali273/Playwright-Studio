/**
 * Zustand store: Runner
 * Tracks execution status and progress.
 */
import type { RunnerStatus } from '../../shared/types';
interface RunnerState {
    status: RunnerStatus;
    currentStepId: string | null;
    progress: {
        completed: number;
        total: number;
    };
    setStatus: (status: RunnerStatus) => void;
    setCurrentStepId: (stepId: string | null) => void;
    setProgress: (progress: {
        completed: number;
        total: number;
    }) => void;
    reset: () => void;
}
export declare const useRunnerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RunnerState>>;
export {};
//# sourceMappingURL=runner-store.d.ts.map