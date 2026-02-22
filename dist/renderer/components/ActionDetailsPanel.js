"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionDetailsPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const steps_store_1 = require("../stores/steps-store");
const logs_store_1 = require("../stores/logs-store");
const constants_1 = require("../../shared/constants");
function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}
function formatDuration(startTs, nowTs) {
    const ms = Math.max(0, nowTs - startTs);
    if (ms < 1000)
        return `${ms} ms`;
    const s = ms / 1000;
    return `${s.toFixed(1)} s`;
}
function getStatusClass(status) {
    if (status === 'passed')
        return 'action-details__status action-details__status--passed';
    if (status === 'failed')
        return 'action-details__status action-details__status--failed';
    if (status === 'running')
        return 'action-details__status action-details__status--running';
    if (status === 'skipped')
        return 'action-details__status action-details__status--skipped';
    return 'action-details__status action-details__status--idle';
}
const ActionDetailsPanel = () => {
    const steps = (0, steps_store_1.useStepsStore)((s) => s.steps);
    const selectedStepId = (0, steps_store_1.useStepsStore)((s) => s.selectedStepId);
    const activeStepId = (0, steps_store_1.useStepsStore)((s) => s.activeStepId);
    const logs = (0, logs_store_1.useLogsStore)((s) => s.logs);
    const step = (0, react_1.useMemo)(() => {
        if (!steps.length)
            return null;
        if (selectedStepId) {
            const found = steps.find((s) => s.id === selectedStepId);
            if (found)
                return found;
        }
        if (activeStepId) {
            const found = steps.find((s) => s.id === activeStepId);
            if (found)
                return found;
        }
        return steps[steps.length - 1] ?? null;
    }, [steps, selectedStepId, activeStepId]);
    const nowTs = Date.now();
    const relatedLogs = (0, react_1.useMemo)(() => {
        if (!step)
            return [];
        const byStepId = logs.filter((entry) => entry.stepId === step.id);
        if (byStepId.length > 0) {
            return byStepId.slice(-5);
        }
        const key = step.selector || step.description || step.action;
        if (!key)
            return [];
        return logs.filter((entry) => entry.message.includes(key)).slice(-5);
    }, [logs, step]);
    if (!step) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "action-details action-details--empty", children: (0, jsx_runtime_1.jsx)("p", { className: "action-details__empty-text", children: "Select a step to see action details." }) }));
    }
    const label = constants_1.ACTION_LABELS[step.action] ?? step.action;
    const meta = (step.meta ?? {});
    const attrs = meta.attributes ?? {};
    const primarySelector = step.selector;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "action-details", children: [(0, jsx_runtime_1.jsxs)("div", { className: "action-details__header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "action-details__title-row", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__action-label", children: label }), (0, jsx_runtime_1.jsx)("span", { className: getStatusClass(step.status), children: step.status })] }), primarySelector && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__selector", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__selector-label", children: "Selector" }), (0, jsx_runtime_1.jsx)("code", { className: "action-details__selector-value", children: primarySelector })] })), (0, jsx_runtime_1.jsxs)("div", { className: "action-details__meta-row", children: [(0, jsx_runtime_1.jsxs)("span", { className: "action-details__meta-item", children: ["Time ", formatTime(step.timestamp)] }), (0, jsx_runtime_1.jsx)("span", { className: "action-details__meta-separator", children: "\u2022" }), (0, jsx_runtime_1.jsxs)("span", { className: "action-details__meta-item", children: ["Duration ", formatDuration(step.timestamp, nowTs)] })] })] }), step.value && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__section", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-details__section-label", children: "Value" }), (0, jsx_runtime_1.jsx)("code", { className: "action-details__code", children: step.value })] })), (meta.tagName || meta.innerText || Object.keys(attrs).length > 0) && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__section", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-details__section-label", children: "Element" }), (0, jsx_runtime_1.jsxs)("div", { className: "action-details__element", children: [meta.tagName && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__row", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__key", children: "Tag" }), (0, jsx_runtime_1.jsx)("span", { className: "action-details__value", children: meta.tagName })] })), meta.innerText && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__row", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__key", children: "Text" }), (0, jsx_runtime_1.jsx)("span", { className: "action-details__value", children: meta.innerText })] })), Object.keys(attrs).length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "action-details__attributes", children: Object.entries(attrs).map(([name, value]) => ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__row", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__key", children: name }), (0, jsx_runtime_1.jsx)("span", { className: "action-details__value", children: value })] }, name))) }))] })] })), step.error && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__section", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-details__section-label", children: "Error" }), (0, jsx_runtime_1.jsx)("div", { className: "action-details__error", children: (0, jsx_runtime_1.jsx)("pre", { className: "action-details__error-text", children: step.error }) })] })), relatedLogs.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__section", children: [(0, jsx_runtime_1.jsx)("div", { className: "action-details__section-label", children: "Logs" }), (0, jsx_runtime_1.jsx)("div", { className: "action-details__logs", children: relatedLogs.map((entry) => ((0, jsx_runtime_1.jsxs)("div", { className: "action-details__log-row", children: [(0, jsx_runtime_1.jsx)("span", { className: "action-details__log-time", children: formatTime(entry.timestamp) }), (0, jsx_runtime_1.jsx)("span", { className: "action-details__log-message", children: entry.message })] }, entry.id))) })] }))] }));
};
exports.ActionDetailsPanel = ActionDetailsPanel;
//# sourceMappingURL=ActionDetailsPanel.js.map