"use strict";
/**
 * Preload script for the MAIN renderer window (React UI).
 * Exposes a typed electronAPI object via contextBridge.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_channels_1 = require("../shared/ipc-channels");
function onChannel(channel, callback) {
    electron_1.ipcRenderer.on(channel, callback);
    return () => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    };
}
/* ------------------------------------------------------------------ */
/*  Exposed API                                                        */
/* ------------------------------------------------------------------ */
const electronAPI = {
    /* ---- Recorder ---- */
    startRecording: (url) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RECORDER_START, url),
    stopRecording: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RECORDER_STOP),
    pauseRecording: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RECORDER_PAUSE),
    resumeRecording: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RECORDER_RESUME),
    addAssertion: (payload) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RECORDER_ADD_ASSERTION, payload),
    /* ---- Runner ---- */
    runAll: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RUNNER_RUN_ALL),
    runFrom: (stepId) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RUNNER_RUN_FROM, stepId),
    runStep: (stepId) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RUNNER_RUN_STEP, stepId),
    pauseRunner: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RUNNER_PAUSE),
    stopRunner: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.RUNNER_STOP),
    /* ---- Steps ---- */
    getSteps: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.STEP_GET_ALL),
    updateStep: (step) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.STEP_UPDATE, step),
    deleteStep: (stepId) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.STEP_DELETE, stepId),
    reorderSteps: (stepIds) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.STEP_REORDER, stepIds),
    clearSteps: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.STEP_CLEAR),
    /* ---- Generator ---- */
    exportScript: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.GENERATOR_EXPORT),
    /* ---- Project ---- */
    newProject: (name) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.PROJECT_NEW, name),
    openProject: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.PROJECT_OPEN),
    saveProject: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.PROJECT_SAVE),
    getProjectConfig: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.PROJECT_GET_CONFIG),
    updateProjectConfig: (config) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.PROJECT_UPDATE_CONFIG, config),
    /* ---- Browser ---- */
    navigateTo: (url) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_NAVIGATE, url),
    setBrowserBounds: (bounds) => {
        electron_1.ipcRenderer.send(ipc_channels_1.IpcChannels.BROWSER_SET_BOUNDS, bounds);
    },
    goBack: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_BACK),
    goForward: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_FORWARD),
    reloadBrowser: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_RELOAD),
    hideBrowserView: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_HIDE),
    showBrowserView: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.BROWSER_SHOW),
    /* ---- Inspector ---- */
    inspectStart: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.INSPECTOR_ENABLE),
    inspectStop: () => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.INSPECTOR_DISABLE),
    validateLocator: (locator) => electron_1.ipcRenderer.invoke(ipc_channels_1.IpcChannels.INSPECTOR_VALIDATE_LOCATOR, locator),
    /* ---- Logs ---- */
    clearLogs: () => {
        electron_1.ipcRenderer.send(ipc_channels_1.IpcChannels.LOG_CLEAR);
    },
    /* ---- Event listeners (main → renderer) ---- */
    onRecorderStatus: (cb) => onChannel(ipc_channels_1.IpcChannels.RECORDER_STATUS, (_e, d) => cb(d)),
    onStepAdded: (cb) => onChannel(ipc_channels_1.IpcChannels.STEP_ADDED, (_e, d) => cb(d)),
    onRunnerStatus: (cb) => onChannel(ipc_channels_1.IpcChannels.RUNNER_STATUS, (_e, d) => cb(d)),
    onRunnerStepUpdate: (cb) => onChannel(ipc_channels_1.IpcChannels.RUNNER_STEP_UPDATE, (_e, d) => cb(d)),
    onRunnerComplete: (cb) => onChannel(ipc_channels_1.IpcChannels.RUNNER_COMPLETE, (_e, d) => cb(d)),
    onLogEvent: (cb) => onChannel(ipc_channels_1.IpcChannels.LOG_EVENT, (_e, d) => cb(d)),
    onBrowserNavigated: (cb) => onChannel(ipc_channels_1.IpcChannels.BROWSER_NAVIGATED, (_e, d) => cb(d)),
    onInspectorPick: (cb) => onChannel(ipc_channels_1.IpcChannels.INSPECTOR_PICK, (_e, d) => cb(d)),
    /** Remove all listeners for a specific channel */
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    },
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
//# sourceMappingURL=preload-main.js.map