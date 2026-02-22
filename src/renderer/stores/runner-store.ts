/**
 * Zustand store: Runner
 * Tracks execution status and progress.
 */

import { create } from 'zustand';
import type { RunnerStatus } from '../../shared/types';

interface RunnerState {
  status: RunnerStatus;
  currentStepId: string | null;
  progress: { completed: number; total: number };
  setStatus: (status: RunnerStatus) => void;
  setCurrentStepId: (stepId: string | null) => void;
  setProgress: (progress: { completed: number; total: number }) => void;
  reset: () => void;
}

export const useRunnerStore = create<RunnerState>((set) => ({
  status: 'idle',
  currentStepId: null,
  progress: { completed: 0, total: 0 },

  setStatus: (status) => set({ status }),
  setCurrentStepId: (stepId) => set({ currentStepId: stepId }),
  setProgress: (progress) => set({ progress }),
  reset: () =>
    set({
      status: 'idle',
      currentStepId: null,
      progress: { completed: 0, total: 0 },
    }),
}));
