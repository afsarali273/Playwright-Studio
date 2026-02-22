/**
 * Zustand store: Test Steps
 * Manages the ordered list of test steps, selection, and CRUD operations.
 */

import { create } from 'zustand';
import type { TestStep, StepStatus } from '../../shared/types';

interface StepsState {
  /** Ordered list of all test steps */
  steps: TestStep[];
  /** Currently selected step ID */
  selectedStepId: string | null;
  /** Currently running step ID */
  activeStepId: string | null;

  /* ---- Actions ---- */
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

export const useStepsStore = create<StepsState>((set) => ({
  steps: [],
  selectedStepId: null,
  activeStepId: null,

  setSteps: (steps) => set({ steps }),

  addStep: (step) =>
    set((state) => ({
      steps: [...state.steps, step],
    })),

  updateStep: (stepId, updates) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, ...updates } : s
      ),
    })),

  deleteStep: (stepId) =>
    set((state) => ({
      steps: state.steps.filter((s) => s.id !== stepId),
      selectedStepId:
        state.selectedStepId === stepId ? null : state.selectedStepId,
    })),

  reorderSteps: (orderedIds) =>
    set((state) => {
      const stepMap = new Map(state.steps.map((s) => [s.id, s]));
      const reordered = orderedIds
        .map((id) => stepMap.get(id))
        .filter(Boolean) as TestStep[];
      return { steps: reordered };
    }),

  clearSteps: () =>
    set({ steps: [], selectedStepId: null, activeStepId: null }),

  selectStep: (stepId) => set({ selectedStepId: stepId }),

  setActiveStep: (stepId) => set({ activeStepId: stepId }),

  setStepStatus: (stepId, status, error) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, status, error: error ?? s.error } : s
      ),
    })),

  resetAllStatuses: () =>
    set((state) => ({
      steps: state.steps.map((s) => ({
        ...s,
        status: 'idle' as const,
        error: undefined,
      })),
    })),
}));
