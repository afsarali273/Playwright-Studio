"use strict";
/**
 * useIpcListeners hook
 * Subscribes to all IPC events from the main process and
 * updates the appropriate Zustand stores.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIpcListeners = useIpcListeners;
const react_1 = require("react");
const steps_store_1 = require("../stores/steps-store");
const recorder_store_1 = require("../stores/recorder-store");
const runner_store_1 = require("../stores/runner-store");
const logs_store_1 = require("../stores/logs-store");
const ui_store_1 = require("../stores/ui-store");
/**
 * Call once in the root App component. Sets up all IPC listeners
 * and cleans them up on unmount.
 */
function useIpcListeners() {
    const addStep = (0, steps_store_1.useStepsStore)((s) => s.addStep);
    const setStepStatus = (0, steps_store_1.useStepsStore)((s) => s.setStepStatus);
    const setActiveStep = (0, steps_store_1.useStepsStore)((s) => s.setActiveStep);
    const setRecording = (0, recorder_store_1.useRecorderStore)((s) => s.setRecording);
    const setPaused = (0, recorder_store_1.useRecorderStore)((s) => s.setPaused);
    const setCurrentUrl = (0, recorder_store_1.useRecorderStore)((s) => s.setCurrentUrl);
    const setRunnerStatus = (0, runner_store_1.useRunnerStore)((s) => s.setStatus);
    const setRunnerStepId = (0, runner_store_1.useRunnerStore)((s) => s.setCurrentStepId);
    const setProgress = (0, runner_store_1.useRunnerStore)((s) => s.setProgress);
    const addLog = (0, logs_store_1.useLogsStore)((s) => s.addLog);
    const setBrowserUrl = (0, ui_store_1.useUIStore)((s) => s.setBrowserUrl);
    const setBrowserTitle = (0, ui_store_1.useUIStore)((s) => s.setBrowserTitle);
    const setInspectorPayload = (0, ui_store_1.useUIStore)((s) => s.setInspectorPayload);
    const setInspectorModalOpen = (0, ui_store_1.useUIStore)((s) => s.setInspectorModalOpen);
    (0, react_1.useEffect)(() => {
        /* Guard: only run in Electron environment */
        if (typeof window === 'undefined' || !window.electronAPI)
            return;
        const api = window.electronAPI;
        const unsubs = [];
        /* Recorder status updates */
        unsubs.push(api.onRecorderStatus((data) => {
            setRecording(data.recording);
            if (data.paused !== undefined)
                setPaused(data.paused);
            if (data.url)
                setCurrentUrl(data.url);
        }));
        /* New step recorded */
        unsubs.push(api.onStepAdded((step) => {
            addStep(step);
        }));
        /* Runner status */
        unsubs.push(api.onRunnerStatus((data) => {
            setRunnerStatus(data.status);
            if (data.currentStepId) {
                setRunnerStepId(data.currentStepId);
                setActiveStep(data.currentStepId);
            }
            if (data.progress)
                setProgress(data.progress);
        }));
        /* Runner step result */
        unsubs.push(api.onRunnerStepUpdate((data) => {
            setStepStatus(data.stepId, data.status, data.error);
        }));
        /* Logs */
        unsubs.push(api.onLogEvent((entry) => {
            addLog(entry);
        }));
        /* Browser navigated */
        unsubs.push(api.onBrowserNavigated((data) => {
            setBrowserUrl(data.url);
            setBrowserTitle(data.title);
        }));
        /* Inspector pick */
        unsubs.push(api.onInspectorPick((payload) => {
            setInspectorPayload(payload);
            setInspectorModalOpen(true);
        }));
        return () => {
            unsubs.forEach((fn) => fn());
        };
    }, [
        addStep,
        setStepStatus,
        setActiveStep,
        setRecording,
        setCurrentUrl,
        setRunnerStatus,
        setRunnerStepId,
        setProgress,
        addLog,
        setBrowserUrl,
        setBrowserTitle,
    ]);
}
//# sourceMappingURL=use-ipc-listeners.js.map