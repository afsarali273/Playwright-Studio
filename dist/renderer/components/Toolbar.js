"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Toolbar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Toolbar component
 * Top bar with Record, Stop, Run, Export, and URL navigation controls.
 */
const react_1 = require("react");
const recorder_store_1 = require("../stores/recorder-store");
const runner_store_1 = require("../stores/runner-store");
const steps_store_1 = require("../stores/steps-store");
const ui_store_1 = require("../stores/ui-store");
const Toolbar = () => {
    const isRecording = (0, recorder_store_1.useRecorderStore)((s) => s.isRecording);
    const isPaused = (0, recorder_store_1.useRecorderStore)((s) => s.isPaused);
    const runnerStatus = (0, runner_store_1.useRunnerStore)((s) => s.status);
    const selectedStepId = (0, steps_store_1.useStepsStore)((s) => s.selectedStepId);
    const browserUrl = (0, ui_store_1.useUIStore)((s) => s.browserUrl);
    const logsCollapsed = (0, ui_store_1.useUIStore)((s) => s.logsCollapsed);
    const toggleLogsCollapsed = (0, ui_store_1.useUIStore)((s) => s.toggleLogsCollapsed);
    // We move urlInput to local state but it is actually handled in BrowserHeader now
    // So we don't need it here. But for now, let's just keep the handlers if we need them,
    // or move them.
    // Ideally Toolbar is just the top bar.
    const isRunning = runnerStatus === 'running';
    const inspectorEnabled = (0, ui_store_1.useUIStore)((s) => s.inspectorEnabled);
    const assertionMode = (0, ui_store_1.useUIStore)((s) => s.assertionMode);
    const [viewport, setViewport] = (0, react_1.useState)('1280x720');
    const handleViewportChange = (0, react_1.useCallback)((e) => {
        const value = e.target.value;
        setViewport(value);
        if (!window.electronAPI)
            return;
        const [width, height] = value.split('x').map(Number);
        if (width && height) {
            console.log('Viewport changed to:', width, height);
            // In a real implementation, we would send this to the main process
            // to resize the BrowserView or enable emulation via CDP.
        }
    }, []);
    /* ----------- Handlers ----------- */
    const handleRecord = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        if (isRecording) {
            await window.electronAPI.stopRecording();
            ui_store_1.useUIStore.getState().setInspectorEnabled(false);
            ui_store_1.useUIStore.getState().setAssertionMode(false);
        }
        else {
            const url = browserUrl || undefined;
            await window.electronAPI.startRecording(url);
        }
    }, [isRecording, browserUrl]);
    const handlePause = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        if (isPaused) {
            await window.electronAPI.resumeRecording();
        }
        else {
            await window.electronAPI.pauseRecording();
        }
    }, [isPaused]);
    const handleInspect = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        if (inspectorEnabled) {
            await window.electronAPI.inspectStop();
            ui_store_1.useUIStore.getState().setInspectorEnabled(false);
        }
        else {
            if (assertionMode) {
                ui_store_1.useUIStore.getState().setAssertionMode(false);
            }
            await window.electronAPI.inspectStart();
            ui_store_1.useUIStore.getState().setInspectorEnabled(true);
        }
    }, [inspectorEnabled, assertionMode]);
    const handleAssert = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        if (assertionMode) {
            await window.electronAPI.inspectStop();
            ui_store_1.useUIStore.getState().setAssertionMode(false);
        }
        else {
            if (inspectorEnabled) {
                ui_store_1.useUIStore.getState().setInspectorEnabled(false);
            }
            await window.electronAPI.inspectStart();
            ui_store_1.useUIStore.getState().setAssertionMode(true);
        }
    }, [assertionMode, inspectorEnabled]);
    const handleStop = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        if (isRecording)
            await window.electronAPI.stopRecording();
        if (isRunning)
            await window.electronAPI.stopRunner();
        await window.electronAPI.inspectStop();
        ui_store_1.useUIStore.getState().setInspectorEnabled(false);
        ui_store_1.useUIStore.getState().setAssertionMode(false);
    }, [isRecording, isRunning]);
    const handleRunAll = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        steps_store_1.useStepsStore.getState().resetAllStatuses();
        await window.electronAPI.runAll();
    }, []);
    const handleRunFrom = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI || !selectedStepId)
            return;
        await window.electronAPI.runFrom(selectedStepId);
    }, [selectedStepId]);
    const handleRunStep = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI || !selectedStepId)
            return;
        await window.electronAPI.runStep(selectedStepId);
    }, [selectedStepId]);
    const handleExport = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        const code = await window.electronAPI.exportScript();
        ui_store_1.useUIStore.getState().setExportedCode(code);
        ui_store_1.useUIStore.getState().setExportModalOpen(true);
    }, []);
    /* ----------- Render ----------- */
    return ((0, jsx_runtime_1.jsxs)("div", { className: "h-8 bg-surface-dark w-full flex items-center justify-between px-4 border-b border-border-dark select-none", style: { WebkitAppRegion: 'drag' }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1.5", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-3 h-3 rounded-full bg-[#ff5f56]" }), (0, jsx_runtime_1.jsx)("span", { className: "w-3 h-3 rounded-full bg-[#ffbd2e]" }), (0, jsx_runtime_1.jsx)("span", { className: "w-3 h-3 rounded-full bg-[#27c93f]" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "ml-4 flex items-center gap-4", children: [(0, jsx_runtime_1.jsxs)("button", { className: `flex items-center gap-1.5 text-xs ${isRecording ? 'text-white' : 'text-slate-300'} hover:text-white transition-colors`, onClick: handleRecord, children: [(0, jsx_runtime_1.jsx)("span", { className: `material-symbols-outlined text-sm ${isRecording ? 'text-red-500' : ''}`, children: "radio_button_checked" }), isRecording ? 'Recording' : 'Record'] }), (0, jsx_runtime_1.jsx)("button", { className: `text-xs ${isPaused ? 'text-yellow-400' : 'text-slate-400'} hover:text-white`, onClick: handlePause, disabled: !isRecording, children: isPaused ? 'Resume' : 'Pause' }), (0, jsx_runtime_1.jsx)("button", { className: "text-xs text-slate-400 hover:text-white", onClick: handleStop, disabled: !isRecording && !isRunning, children: "Stop" }), (0, jsx_runtime_1.jsx)("button", { className: `text-xs ${inspectorEnabled ? 'text-white' : 'text-slate-400'} hover:text-white`, onClick: handleInspect, children: "Inspect" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsxs)("button", { className: "flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded text-xs font-bold disabled:opacity-50", onClick: handleRunAll, disabled: isRunning || isRecording, children: [(0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "play_arrow" }), "Run All"] }), (0, jsx_runtime_1.jsxs)("button", { className: "text-xs text-slate-400 hover:text-white flex items-center gap-1 disabled:opacity-50", onClick: handleRunFrom, disabled: isRunning || !selectedStepId, children: [(0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "skip_next" }), "Run From"] }), (0, jsx_runtime_1.jsxs)("button", { className: "text-xs text-slate-400 hover:text-white flex items-center gap-1 disabled:opacity-50", onClick: handleRunStep, disabled: isRunning || !selectedStepId, children: [(0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "redo" }), "Run Step"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("button", { className: "text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors", onClick: toggleLogsCollapsed, title: "Toggle Code Panel", children: (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "side_navigation" }) }), (0, jsx_runtime_1.jsx)("button", { className: "text-slate-400 hover:text-white", onClick: handleExport, title: "Export", children: (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "upload" }) }), (0, jsx_runtime_1.jsx)("div", { className: "h-4 w-[1px] bg-border-dark mx-1" }), (0, jsx_runtime_1.jsxs)("select", { className: "bg-transparent text-[10px] text-slate-400 border-none focus:ring-0 p-0 cursor-pointer outline-none", value: viewport, onChange: handleViewportChange, children: [(0, jsx_runtime_1.jsx)("option", { value: "1280x720", children: "Laptop (1280x720)" }), (0, jsx_runtime_1.jsx)("option", { value: "1920x1080", children: "Desktop (1920x1080)" }), (0, jsx_runtime_1.jsx)("option", { value: "375x667", children: "Mobile (375x667)" })] })] })] }));
};
exports.Toolbar = Toolbar;
//# sourceMappingURL=Toolbar.js.map