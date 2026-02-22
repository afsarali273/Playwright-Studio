"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const runner_store_1 = require("../stores/runner-store");
const recorder_store_1 = require("../stores/recorder-store");
const steps_store_1 = require("../stores/steps-store");
const StatusBar = () => {
    const runnerStatus = (0, runner_store_1.useRunnerStore)((s) => s.status);
    const progress = (0, runner_store_1.useRunnerStore)((s) => s.progress);
    const isRecording = (0, recorder_store_1.useRecorderStore)((s) => s.isRecording);
    const steps = (0, steps_store_1.useStepsStore)((s) => s.steps);
    const passedCount = steps.filter((s) => s.status === 'passed').length;
    const failedCount = steps.filter((s) => s.status === 'failed').length;
    return ((0, jsx_runtime_1.jsxs)("footer", { className: "status-bar", role: "status", "aria-live": "polite", children: [(0, jsx_runtime_1.jsxs)("div", { className: "status-bar__left", children: [isRecording && ((0, jsx_runtime_1.jsx)("span", { className: "status-bar__recording", children: "Recording..." })), runnerStatus === 'running' && ((0, jsx_runtime_1.jsxs)("span", { className: "status-bar__running", children: ["Running: ", progress.completed, "/", progress.total] })), runnerStatus === 'paused' && ((0, jsx_runtime_1.jsx)("span", { className: "status-bar__paused", children: "Paused" })), runnerStatus === 'idle' && !isRecording && ((0, jsx_runtime_1.jsx)("span", { className: "status-bar__idle", children: "Ready" }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-bar__right", children: [(0, jsx_runtime_1.jsxs)("span", { className: "status-bar__stat", children: ["Steps: ", steps.length] }), passedCount > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "status-bar__stat status-bar__stat--passed", children: ["Passed: ", passedCount] })), failedCount > 0 && ((0, jsx_runtime_1.jsxs)("span", { className: "status-bar__stat status-bar__stat--failed", children: ["Failed: ", failedCount] }))] })] }));
};
exports.StatusBar = StatusBar;
//# sourceMappingURL=StatusBar.js.map