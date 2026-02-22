/**
 * Preload script for the MAIN renderer window (React UI).
 * Exposes a typed electronAPI object via contextBridge.
 */
import type { TestStep, BrowserBounds, ProjectConfig, LogEntry, RecorderStatusPayload, RunnerStatusPayload, StepUpdatePayload, RunResult, InspectorPayload } from '../shared/types';
declare const electronAPI: {
    startRecording: (url?: string) => Promise<void>;
    stopRecording: () => Promise<void>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;
    addAssertion: (payload: {
        selector: string;
        assertionType: string;
        assertionValue?: string;
        timestamp: number;
    }) => Promise<void>;
    runAll: () => Promise<void>;
    runFrom: (stepId: string) => Promise<void>;
    runStep: (stepId: string) => Promise<void>;
    pauseRunner: () => Promise<void>;
    stopRunner: () => Promise<void>;
    getSteps: () => Promise<TestStep[]>;
    updateStep: (step: TestStep) => Promise<void>;
    deleteStep: (stepId: string) => Promise<void>;
    reorderSteps: (stepIds: string[]) => Promise<void>;
    clearSteps: () => Promise<void>;
    exportScript: () => Promise<string>;
    newProject: (name: string) => Promise<void>;
    openProject: () => Promise<string | null>;
    saveProject: () => Promise<void>;
    getProjectConfig: () => Promise<ProjectConfig | null>;
    updateProjectConfig: (config: Partial<ProjectConfig>) => Promise<void>;
    navigateTo: (url: string) => Promise<void>;
    setBrowserBounds: (bounds: BrowserBounds) => void;
    goBack: () => Promise<void>;
    goForward: () => Promise<void>;
    reloadBrowser: () => Promise<void>;
    hideBrowserView: () => Promise<void>;
    showBrowserView: () => Promise<void>;
    inspectStart: () => Promise<void>;
    inspectStop: () => Promise<void>;
    validateLocator: (locator: string) => Promise<{
        count: number;
        error?: string;
    }>;
    clearLogs: () => void;
    onRecorderStatus: (cb: (data: RecorderStatusPayload) => void) => () => void;
    onStepAdded: (cb: (step: TestStep) => void) => () => void;
    onRunnerStatus: (cb: (data: RunnerStatusPayload) => void) => () => void;
    onRunnerStepUpdate: (cb: (data: StepUpdatePayload) => void) => () => void;
    onRunnerComplete: (cb: (data: RunResult) => void) => () => void;
    onLogEvent: (cb: (entry: LogEntry) => void) => () => void;
    onBrowserNavigated: (cb: (data: {
        url: string;
        title: string;
    }) => void) => () => void;
    onInspectorPick: (cb: (payload: InspectorPayload) => void) => () => void;
    /** Remove all listeners for a specific channel */
    removeAllListeners: (channel: string) => void;
};
/** Export the type for the renderer to reference */
export type ElectronAPI = typeof electronAPI;
export {};
//# sourceMappingURL=preload-main.d.ts.map