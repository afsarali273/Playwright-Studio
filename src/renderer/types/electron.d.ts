/**
 * Global type declaration for the Electron preload API.
 * Consumed by the renderer (React) process.
 */

import type {
  TestStep,
  BrowserBounds,
  ProjectConfig,
  LogEntry,
  RecorderStatusPayload,
  RunnerStatusPayload,
  StepUpdatePayload,
  RunResult,
  InspectorPayload,
} from '../shared/types';

export interface ElectronAPI {
  /* ---- Recorder ---- */
  startRecording: (url?: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  addAssertion: (payload: { selector: string; assertionType: string; assertionValue?: string; timestamp: number }) => Promise<void>;

  /* ---- Runner ---- */
  runAll: () => Promise<void>;
  runFrom: (stepId: string) => Promise<void>;
  runStep: (stepId: string) => Promise<void>;
  pauseRunner: () => Promise<void>;
  stopRunner: () => Promise<void>;

  /* ---- Steps ---- */
  getSteps: () => Promise<TestStep[]>;
  updateStep: (step: TestStep) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  reorderSteps: (stepIds: string[]) => Promise<void>;
  clearSteps: () => Promise<void>;

  /* ---- Generator ---- */
  exportScript: () => Promise<string>;

  /* ---- Project ---- */
  newProject: (name: string) => Promise<void>;
  openProject: () => Promise<string | null>;
  saveProject: () => Promise<void>;
  getProjectConfig: () => Promise<ProjectConfig | null>;
  updateProjectConfig: (config: Partial<ProjectConfig>) => Promise<void>;

  /* ---- Browser ---- */
  navigateTo: (url: string) => Promise<void>;
  setBrowserBounds: (bounds: BrowserBounds) => void;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  reloadBrowser: () => Promise<void>;
  hideBrowserView: () => Promise<void>;
  showBrowserView: () => Promise<void>;

  /* ---- Inspector ---- */
  inspectStart: () => Promise<void>;
  inspectStop: () => Promise<void>;
  validateLocator: (locator: string) => Promise<{ count: number; error?: string }>;

  /* ---- Logs ---- */
  clearLogs: () => void;

  /* ---- Event listeners ---- */
  onRecorderStatus: (cb: (data: RecorderStatusPayload) => void) => () => void;
  onStepAdded: (cb: (step: TestStep) => void) => () => void;
  onRunnerStatus: (cb: (data: RunnerStatusPayload) => void) => () => void;
  onRunnerStepUpdate: (cb: (data: StepUpdatePayload) => void) => () => void;
  onRunnerComplete: (cb: (data: RunResult) => void) => () => void;
  onLogEvent: (cb: (entry: LogEntry) => void) => () => void;
  onBrowserNavigated: (cb: (data: { url: string; title: string }) => void) => () => void;
  onInspectorPick: (cb: (payload: InspectorPayload) => void) => () => void;

  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
