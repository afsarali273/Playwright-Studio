/**
 * Preload script for the MAIN renderer window (React UI).
 * Exposes a typed electronAPI object via contextBridge.
 */

import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { IpcChannels } from '../shared/ipc-channels';
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

/* ------------------------------------------------------------------ */
/*  Typed callback helpers                                             */
/* ------------------------------------------------------------------ */

type Callback<T> = (event: IpcRendererEvent, data: T) => void;

function onChannel<T>(channel: string, callback: Callback<T>): () => void {
  ipcRenderer.on(channel, callback);
  return () => {
    ipcRenderer.removeListener(channel, callback);
  };
}

/* ------------------------------------------------------------------ */
/*  Exposed API                                                        */
/* ------------------------------------------------------------------ */

const electronAPI = {
  /* ---- Recorder ---- */
  startRecording: (url?: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RECORDER_START, url),
  stopRecording: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RECORDER_STOP),
  pauseRecording: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RECORDER_PAUSE),
  resumeRecording: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RECORDER_RESUME),
  addAssertion: (payload: { selector: string; assertionType: string; assertionValue?: string; timestamp: number }): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RECORDER_ADD_ASSERTION, payload),

  /* ---- Runner ---- */
  runAll: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RUNNER_RUN_ALL),
  runFrom: (stepId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RUNNER_RUN_FROM, stepId),
  runStep: (stepId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RUNNER_RUN_STEP, stepId),
  pauseRunner: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RUNNER_PAUSE),
  stopRunner: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.RUNNER_STOP),

  /* ---- Steps ---- */
  getSteps: (): Promise<TestStep[]> =>
    ipcRenderer.invoke(IpcChannels.STEP_GET_ALL),
  updateStep: (step: TestStep): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.STEP_UPDATE, step),
  deleteStep: (stepId: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.STEP_DELETE, stepId),
  reorderSteps: (stepIds: string[]): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.STEP_REORDER, stepIds),
  clearSteps: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.STEP_CLEAR),

  /* ---- Generator ---- */
  exportScript: (language: 'typescript' | 'java' = 'typescript'): Promise<string> =>
    ipcRenderer.invoke(IpcChannels.GENERATOR_EXPORT, language),

  /* ---- Project ---- */
  newProject: (name: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.PROJECT_NEW, name),
  openProject: (): Promise<string | null> =>
    ipcRenderer.invoke(IpcChannels.PROJECT_OPEN),
  saveProject: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.PROJECT_SAVE),
  getProjectConfig: (): Promise<ProjectConfig | null> =>
    ipcRenderer.invoke(IpcChannels.PROJECT_GET_CONFIG),
  updateProjectConfig: (config: Partial<ProjectConfig>): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.PROJECT_UPDATE_CONFIG, config),

  /* ---- Browser ---- */
  navigateTo: (url: string): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_NAVIGATE, url),
  setBrowserBounds: (bounds: BrowserBounds): void => {
    ipcRenderer.send(IpcChannels.BROWSER_SET_BOUNDS, bounds);
  },
  goBack: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_BACK),
  goForward: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_FORWARD),
  reloadBrowser: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_RELOAD),
  hideBrowserView: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_HIDE),
  showBrowserView: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.BROWSER_SHOW),

  /* ---- Inspector ---- */
  inspectStart: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.INSPECTOR_ENABLE),
  inspectStop: (): Promise<void> =>
    ipcRenderer.invoke(IpcChannels.INSPECTOR_DISABLE),
  validateLocator: (locator: string): Promise<{ count: number; error?: string }> =>
    ipcRenderer.invoke(IpcChannels.INSPECTOR_VALIDATE_LOCATOR, locator),

  /* ---- Logs ---- */
  clearLogs: (): void => {
    ipcRenderer.send(IpcChannels.LOG_CLEAR);
  },

  /* ---- Event listeners (main → renderer) ---- */
  onRecorderStatus: (cb: (data: RecorderStatusPayload) => void) =>
    onChannel<RecorderStatusPayload>(IpcChannels.RECORDER_STATUS, (_e, d) => cb(d)),
  onStepAdded: (cb: (step: TestStep) => void) =>
    onChannel<TestStep>(IpcChannels.STEP_ADDED, (_e, d) => cb(d)),
  onRunnerStatus: (cb: (data: RunnerStatusPayload) => void) =>
    onChannel<RunnerStatusPayload>(IpcChannels.RUNNER_STATUS, (_e, d) => cb(d)),
  onRunnerStepUpdate: (cb: (data: StepUpdatePayload) => void) =>
    onChannel<StepUpdatePayload>(IpcChannels.RUNNER_STEP_UPDATE, (_e, d) => cb(d)),
  onRunnerComplete: (cb: (data: RunResult) => void) =>
    onChannel<RunResult>(IpcChannels.RUNNER_COMPLETE, (_e, d) => cb(d)),
  onLogEvent: (cb: (entry: LogEntry) => void) =>
    onChannel<LogEntry>(IpcChannels.LOG_EVENT, (_e, d) => cb(d)),
  onBrowserNavigated: (cb: (data: { url: string; title: string }) => void) =>
    onChannel<{ url: string; title: string }>(IpcChannels.BROWSER_NAVIGATED, (_e, d) => cb(d)),
  onInspectorPick: (cb: (payload: InspectorPayload) => void) =>
    onChannel<InspectorPayload>(IpcChannels.INSPECTOR_PICK, (_e, d) => cb(d)),

  /** Remove all listeners for a specific channel */
  removeAllListeners: (channel: string): void => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

/** Export the type for the renderer to reference */
export type ElectronAPI = typeof electronAPI;
