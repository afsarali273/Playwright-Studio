"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepList = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * StepList component
 * Left panel displaying all recorded test steps with status indicators.
 * Supports selection, deletion, and drag-to-reorder.
 */
const react_1 = require("react");
const steps_store_1 = require("../stores/steps-store");
const runner_store_1 = require("../stores/runner-store");
const constants_1 = require("../../shared/constants");
const lucide_react_1 = require("lucide-react");
/* ---- Icon mapping for action types ---- */
function ActionIcon({ action, className }) {
    const size = 14;
    switch (action) {
        case 'click':
        case 'dblclick':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.MousePointerClick, { size: size, className: className });
        case 'input':
        case 'change':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Type, { size: size, className: className });
        case 'navigate':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Navigation, { size: size, className: className });
        case 'keydown':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Keyboard, { size: size, className: className });
        case 'check':
        case 'uncheck':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.CheckSquare, { size: size, className: className });
        case 'assert':
            return (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: size, className: className });
        default:
            return (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: size, className: className });
    }
}
const StepRow = ({ step, index, isSelected, isActive, onSelect, onDelete, }) => {
    const meta = (step.meta ?? {});
    const candidates = meta.selectorCandidates ?? [];
    let selectorLabel = step.selector;
    let selectorStrategy;
    if (candidates.length > 0) {
        const primary = candidates.find((c) => c.value === step.selector) ?? candidates[0];
        if (primary) {
            selectorLabel = primary.value;
            selectorStrategy = primary.strategy;
        }
    }
    const handleCopy = async (e, text) => {
        e.stopPropagation();
        if (!text)
            return;
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            }
            catch {
            }
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `rounded transition-all ${isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-surface-lighter/30 border border-transparent hover:border-primary/30'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: `flex items-start gap-3 p-2 cursor-pointer relative group ${isActive ? 'ring-1 ring-yellow-500 rounded' : ''}`, onClick: () => onSelect(step.id), children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] text-slate-500 mt-1", children: index + 1 }), (0, jsx_runtime_1.jsx)("span", { className: "mt-1", children: (0, jsx_runtime_1.jsx)(ActionIcon, { action: step.action, className: isSelected ? 'text-primary' : 'text-slate-400' }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: `text-xs font-bold ${isSelected ? 'text-slate-200' : 'text-slate-300'}`, children: constants_1.ACTION_LABELS[step.action] || step.action }), (0, jsx_runtime_1.jsxs)("div", { className: `text-[10px] truncate font-mono mt-0.5 ${isSelected ? 'text-primary' : 'text-slate-500'}`, title: selectorLabel, children: [selectorStrategy ? `[${selectorStrategy}] ` : '', selectorLabel] }), step.value && ((0, jsx_runtime_1.jsxs)("div", { className: "text-[10px] text-green-400 font-mono truncate", title: step.value, children: ["\"", step.value, "\""] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1", children: [(0, jsx_runtime_1.jsx)("button", { className: "p-1 hover:text-white text-slate-400", onClick: (e) => handleCopy(e, selectorLabel), title: "Copy locator", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 12 }) }), (0, jsx_runtime_1.jsx)("button", { className: "p-1 hover:text-red-400 text-slate-400", onClick: (e) => {
                                    e.stopPropagation();
                                    onDelete(step.id);
                                }, title: "Delete step", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 12 }) })] })] }), isSelected && candidates.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "px-2 pb-2 pt-1 bg-black/20 mx-1 mb-1 rounded-b", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 pt-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronDown, { size: 12 }), (0, jsx_runtime_1.jsx)("span", { children: "Available Locators" })] }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: candidates.map((c, i) => {
                            const isHighConfidence = c.confidence >= 0.9;
                            const isMediumConfidence = c.confidence >= 0.7 && c.confidence < 0.9;
                            return ((0, jsx_runtime_1.jsxs)("div", { className: "group/item relative flex flex-col gap-1 p-2 rounded bg-surface-dark border border-border-dark/50 hover:border-primary/30 hover:bg-surface-lighter/10 transition-all", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[9px] font-bold text-slate-400 uppercase tracking-wider", children: c.strategy }), isHighConfidence && (0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-green-400 font-medium", children: "Recommended" })] }), (0, jsx_runtime_1.jsxs)("span", { className: `text-[9px] font-mono px-1.5 py-0.5 rounded ${isHighConfidence ? 'bg-green-500/10 text-green-400' :
                                                    isMediumConfidence ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'}`, children: [(c.confidence * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("code", { className: "flex-1 text-[11px] font-mono text-slate-300 break-all leading-relaxed bg-black/20 p-1.5 rounded border border-white/5", children: c.value }), (0, jsx_runtime_1.jsx)("button", { className: "text-slate-500 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors", onClick: (e) => handleCopy(e, c.value), title: "Copy locator", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 12 }) })] })] }, i));
                        }) })] }))] }));
};
/* ---- Main StepList ---- */
const StepList = () => {
    const steps = (0, steps_store_1.useStepsStore)((s) => s.steps);
    const selectedStepId = (0, steps_store_1.useStepsStore)((s) => s.selectedStepId);
    const activeStepId = (0, runner_store_1.useRunnerStore)((s) => s.currentStepId);
    const handleDelete = (0, react_1.useCallback)(async (stepId) => {
        steps_store_1.useStepsStore.getState().deleteStep(stepId);
        if (window.electronAPI) {
            await window.electronAPI.deleteStep(stepId);
        }
    }, []);
    const handleClear = (0, react_1.useCallback)(async () => {
        steps_store_1.useStepsStore.getState().clearSteps();
        if (window.electronAPI) {
            await window.electronAPI.clearSteps();
        }
    }, []);
    const handleSelect = (0, react_1.useCallback)((stepId) => {
        const currentSelected = steps_store_1.useStepsStore.getState().selectedStepId;
        steps_store_1.useStepsStore.getState().selectStep(currentSelected === stepId ? null : stepId);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "w-64 flex flex-col bg-surface-dark border-r border-border-dark flex-shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-3 border-b border-border-dark flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest", children: "Steps" }), (0, jsx_runtime_1.jsx)("span", { className: "bg-slate-700 text-[10px] px-1.5 rounded text-slate-300", children: steps.length })] }), (0, jsx_runtime_1.jsx)("button", { className: "text-[10px] text-slate-500 hover:text-slate-300 uppercase", onClick: handleClear, children: "Clear" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-y-auto custom-scrollbar", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-2 space-y-1", children: [steps.map((step, idx) => ((0, jsx_runtime_1.jsx)(StepRow, { step: step, index: idx, isSelected: step.id === selectedStepId, isActive: step.id === activeStepId, onSelect: handleSelect, onDelete: handleDelete }, step.id))), steps.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 text-center text-slate-500 text-xs", children: ["No steps recorded. ", (0, jsx_runtime_1.jsx)("br", {}), " Click Record to start."] }))] }) })] }));
};
exports.StepList = StepList;
//# sourceMappingURL=StepList.js.map