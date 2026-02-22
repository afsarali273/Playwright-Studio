"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectorPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * InspectorPanel component
 * Shows details of the inspected element including locator candidates.
 * Replaces the LogPanel content when active.
 */
const react_1 = require("react");
const ui_store_1 = require("../stores/ui-store");
const lucide_react_1 = require("lucide-react");
const InspectorPanel = () => {
    const payload = (0, ui_store_1.useUIStore)((s) => s.inspectorPayload);
    const setOpen = (0, ui_store_1.useUIStore)((s) => s.setInspectorModalOpen);
    const setEnabled = (0, ui_store_1.useUIStore)((s) => s.setInspectorEnabled);
    const [validatorValue, setValidatorValue] = (0, react_1.useState)('');
    const [validationResult, setValidationResult] = (0, react_1.useState)(null);
    const assertionMode = (0, ui_store_1.useUIStore)((s) => s.assertionMode);
    const setAssertionMode = (0, ui_store_1.useUIStore)((s) => s.setAssertionMode);
    // Assertion state
    const [selectedAssertion, setSelectedAssertion] = (0, react_1.useState)('toBeVisible');
    const [assertionValue, setAssertionValue] = (0, react_1.useState)('');
    // Reset validator when payload changes
    (0, react_1.useEffect)(() => {
        setValidationResult(null);
        if (payload?.candidates && payload.candidates.length > 0) {
            const best = payload.candidates.find(c => c.strategy === 'css' ||
                c.strategy === 'xpath' ||
                c.strategy === 'relative-xpath' ||
                c.strategy === 'complex-xpath');
            if (best) {
                setValidatorValue(best.value);
            }
        }
        // Default assertion value based on element
        if (payload?.innerText) {
            setSelectedAssertion('toHaveText');
            setAssertionValue(payload.innerText);
        }
        else if (payload?.tagName === 'input' || payload?.tagName === 'textarea') {
            setSelectedAssertion('toHaveValue');
            setAssertionValue('');
        }
        else {
            setSelectedAssertion('toBeVisible');
            setAssertionValue('');
        }
    }, [payload]);
    const handleClose = (0, react_1.useCallback)(() => {
        setOpen(false);
        setEnabled(false);
        setAssertionMode(false);
        if (window.electronAPI) {
            window.electronAPI.inspectStop();
        }
    }, []);
    const handleCopy = async (text) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
            }
            catch { }
        }
    };
    const handleValidate = async (val) => {
        if (!window.electronAPI || !val)
            return;
        if (val.includes('getBy') || val.includes('page.')) {
            setValidationResult({ count: 0, error: 'Only CSS/XPath supported for live check.' });
            return;
        }
        const result = await window.electronAPI.validateLocator(val);
        setValidationResult(result);
    };
    const handleAddAssertion = async () => {
        if (!window.electronAPI || !payload)
            return;
        const bestCandidate = payload.candidates.find(c => c.strategy === 'css' ||
            c.strategy === 'xpath' ||
            c.strategy === 'relative-xpath' ||
            c.strategy === 'complex-xpath') || payload.candidates[0];
        if (!bestCandidate)
            return;
        const api = window.electronAPI;
        if (api.addAssertion) {
            await api.addAssertion({
                selector: bestCandidate.value,
                assertionType: selectedAssertion,
                assertionValue: assertionValue,
                timestamp: Date.now()
            });
            handleClose();
        }
    };
    if (!payload) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "text-[10px] text-slate-500 italic p-2 text-center", children: "Hover over an element to inspect..." }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center text-[10px] text-slate-500", children: [(0, jsx_runtime_1.jsx)("span", { children: "INSPECTOR" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12 }) })] }), assertionMode && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2 bg-primary/10 p-2 rounded border border-primary/20", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-[10px] font-bold text-primary flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 10 }), " Add Assertion"] }), (0, jsx_runtime_1.jsxs)("select", { className: "w-full bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none", value: selectedAssertion, onChange: (e) => setSelectedAssertion(e.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "toBeVisible", children: "toBeVisible" }), (0, jsx_runtime_1.jsx)("option", { value: "toHaveText", children: "toHaveText" }), (0, jsx_runtime_1.jsx)("option", { value: "toHaveValue", children: "toHaveValue" }), (0, jsx_runtime_1.jsx)("option", { value: "toContainText", children: "toContainText" }), (0, jsx_runtime_1.jsx)("option", { value: "toHaveAttribute", children: "toHaveAttribute" }), (0, jsx_runtime_1.jsx)("option", { value: "toHaveCount", children: "toHaveCount" })] }), selectedAssertion !== 'toBeVisible' && ((0, jsx_runtime_1.jsx)("input", { type: "text", value: assertionValue, onChange: (e) => setAssertionValue(e.target.value), className: "w-full bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none placeholder:text-slate-600", placeholder: "Expected Value..." })), (0, jsx_runtime_1.jsx)("button", { className: "w-full py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover", onClick: handleAddAssertion, children: "Add Step" })] })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-[10px] text-slate-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "TAG" }), (0, jsx_runtime_1.jsx)("span", { className: "text-slate-200 font-mono", children: payload.tagName })] }), payload.innerText && ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-[10px] text-slate-400", children: [(0, jsx_runtime_1.jsx)("span", { children: "TEXT" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-slate-200 font-mono truncate max-w-[150px]", title: payload.innerText, children: ["\"", payload.innerText, "\""] })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] text-slate-500 font-bold", children: "LOCATORS" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar", children: payload.candidates.map((candidate, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: "group flex flex-col gap-0.5 p-1.5 rounded hover:bg-surface-lighter/30 cursor-pointer", onClick: () => setValidatorValue(candidate.value), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-slate-500 uppercase", children: candidate.strategy }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[9px] text-green-500/80", children: [(candidate.confidence * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-end gap-2", children: [(0, jsx_runtime_1.jsx)("code", { className: "text-[10px] text-slate-300 font-mono break-all leading-tight", children: candidate.value }), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => { e.stopPropagation(); handleCopy(candidate.value); }, className: "opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 10 }) })] })] }, idx))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 pt-2 border-t border-border-dark", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] text-slate-500 font-bold", children: "VALIDATOR" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", className: "flex-1 bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none placeholder:text-slate-600 font-mono", value: validatorValue, onChange: (e) => setValidatorValue(e.target.value), placeholder: "CSS/XPath...", onKeyDown: (e) => e.key === 'Enter' && handleValidate(validatorValue) }), (0, jsx_runtime_1.jsx)("button", { className: "px-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600", onClick: () => handleValidate(validatorValue), children: (0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 10 }) })] }), validationResult && ((0, jsx_runtime_1.jsx)("div", { className: `text-[10px] flex items-center gap-1.5 p-1 rounded ${validationResult.error ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`, children: validationResult.error ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 10 }), (0, jsx_runtime_1.jsx)("span", { children: validationResult.error })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 10 }), (0, jsx_runtime_1.jsxs)("span", { children: [validationResult.count, " match(es)"] })] })) }))] })] }));
};
exports.InspectorPanel = InspectorPanel;
//# sourceMappingURL=InspectorPanel.js.map