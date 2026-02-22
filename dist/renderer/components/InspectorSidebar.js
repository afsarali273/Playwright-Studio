"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectorSidebar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ui_store_1 = require("../stores/ui-store");
const lucide_react_1 = require("lucide-react");
const InspectorSidebar = () => {
    const payload = (0, ui_store_1.useUIStore)((s) => s.inspectorPayload);
    const setAssertionMode = (0, ui_store_1.useUIStore)((s) => s.setAssertionMode);
    const [copiedLocator, setCopiedLocator] = (0, react_1.useState)(null);
    const [selectedLocator, setSelectedLocator] = (0, react_1.useState)('');
    // Validation state
    const [validationResult, setValidationResult] = (0, react_1.useState)(null);
    const [isValidating, setIsValidating] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (payload?.candidates && payload.candidates.length > 0) {
            // Default to the first one (Highest confidence)
            const best = payload.candidates[0];
            setSelectedLocator(best.value);
            // Auto-validate the best locator initially? Maybe too noisy.
            // Let's validate only when user selects or clicks validate.
        }
    }, [payload]);
    // Re-validate when selected locator changes
    (0, react_1.useEffect)(() => {
        if (selectedLocator) {
            handleValidate(selectedLocator);
        }
    }, [selectedLocator]);
    const handleCopy = (0, react_1.useCallback)(async (text) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            setCopiedLocator(text);
            setTimeout(() => setCopiedLocator(null), 2000);
        }
    }, []);
    const handleValidate = async (val) => {
        if (!window.electronAPI || !val)
            return;
        setIsValidating(true);
        // Check if it's a Playwright locator vs CSS/XPath
        if (val.includes('getBy') || val.includes('page.')) {
            // We can't validate Playwright locators easily in the browser context directly 
            // without a full runner roundtrip, unless we map them back to CSS/XPath.
            // For now, we'll show a warning or try to approximate.
            // The injected script only supports CSS/XPath validation.
            setValidationResult({ count: 0, error: 'Playwright locator validation requires running test.' });
            setIsValidating(false);
            return;
        }
        const result = await window.electronAPI.validateLocator(val);
        setValidationResult(result);
        setIsValidating(false);
    };
    const handleAddAssertion = async (type, value) => {
        if (!window.electronAPI || !selectedLocator)
            return;
        // Switch to assertion mode if not active
        setAssertionMode(true);
        const api = window.electronAPI;
        if (api.addAssertion) {
            await api.addAssertion({
                selector: selectedLocator,
                assertionType: type,
                assertionValue: value || '',
                timestamp: Date.now()
            });
        }
    };
    const handleGenerateStep = async (action) => {
        // TODO: Implement manual step addition
        console.log('Generate step:', action, selectedLocator);
    };
    if (!payload) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { size: 48, className: "mb-4 opacity-20" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-bold text-slate-400 mb-2", children: "Inspector Active" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs", children: "Hover over elements in the browser to view their properties and generate locators." })] }));
    }
    // Categorize strategies
    const recommended = payload.candidates.filter(c => c.confidence >= 0.9);
    const alternate = payload.candidates.filter(c => c.confidence >= 0.6 && c.confidence < 0.9);
    const legacy = payload.candidates.filter(c => c.confidence < 0.6);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full bg-surface-dark border-l border-border-dark w-[350px] overflow-y-auto custom-scrollbar", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-4 border-b border-border-dark bg-surface-dark sticky top-0 z-10", children: (0, jsx_runtime_1.jsxs)("h2", { className: "text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Target, { size: 14, className: "text-primary" }), "Inspector"] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 space-y-6", children: [(0, jsx_runtime_1.jsxs)("section", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Selected Locator" }), (0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-black/20 rounded border border-primary/30", children: [(0, jsx_runtime_1.jsx)("code", { className: "text-[11px] font-mono text-white block break-all mb-2", children: selectedLocator }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: (0, jsx_runtime_1.jsxs)("button", { className: "text-[10px] flex items-center gap-1 text-slate-400 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors", onClick: () => handleCopy(selectedLocator), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 10 }), " ", copiedLocator === selectedLocator ? 'Copied' : 'Copy'] }) }), (0, jsx_runtime_1.jsx)("div", { className: `text-[10px] flex items-center gap-1 px-2 py-1 rounded ${validationResult?.error ? 'text-red-400 bg-red-500/10' :
                                                    validationResult?.count === 1 ? 'text-green-400 bg-green-500/10' :
                                                        validationResult?.count === 0 ? 'text-yellow-400 bg-yellow-500/10' :
                                                            'text-blue-400 bg-blue-500/10'}`, children: isValidating ? ((0, jsx_runtime_1.jsx)("span", { children: "Checking..." })) : validationResult?.error ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertCircle, { size: 10 }), (0, jsx_runtime_1.jsx)("span", { children: "Preview unavailable (Run to verify)" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 10 }), (0, jsx_runtime_1.jsxs)("span", { children: [validationResult?.count ?? 0, " Match(es)"] })] })) })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-between mb-2", children: (0, jsx_runtime_1.jsx)("h3", { className: "text-[11px] font-bold text-slate-400 uppercase", children: "Available Strategies" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [recommended.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-[10px] font-bold text-green-400 flex items-center gap-1 mb-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { size: 10 }), " RECOMMENDED"] }), recommended.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`, onClick: () => setSelectedLocator(c.value), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-slate-500 uppercase font-bold", children: c.strategy }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[9px] bg-green-500/20 text-green-400 px-1.5 rounded font-mono", children: [(c.confidence * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsx)("code", { className: "text-[10px] font-mono text-slate-300 block break-all leading-relaxed", children: c.value })] }, i)))] })), alternate.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] font-bold text-yellow-400 mb-1", children: "ALTERNATE" }), alternate.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`, onClick: () => setSelectedLocator(c.value), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-slate-500 uppercase font-bold", children: c.strategy }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 rounded font-mono", children: [(c.confidence * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsx)("code", { className: "text-[10px] font-mono text-slate-300 block break-all leading-relaxed", children: c.value })] }, i)))] })), legacy.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] font-bold text-red-400 mb-1", children: "LEGACY" }), legacy.map((c, i) => ((0, jsx_runtime_1.jsxs)("div", { className: `p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`, onClick: () => setSelectedLocator(c.value), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[9px] text-slate-500 uppercase font-bold", children: c.strategy }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[9px] bg-red-500/20 text-red-400 px-1.5 rounded font-mono", children: [(c.confidence * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsx)("code", { className: "text-[10px] font-mono text-slate-400 block break-all leading-relaxed", children: c.value })] }, i)))] }))] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-[11px] font-bold text-slate-400 uppercase mb-2", children: "Element Properties" }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-surface-lighter/20 rounded", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[9px] text-slate-500 uppercase", children: "TAG" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-[11px] text-primary font-mono", children: ["<", payload.tagName, ">"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-surface-lighter/20 rounded", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[9px] text-slate-500 uppercase", children: "VISIBLE" }), (0, jsx_runtime_1.jsx)("div", { className: `text-[11px] font-bold ${payload.isVisible ? 'text-green-400' : 'text-red-400'}`, children: String(payload.isVisible) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-surface-lighter/20 rounded", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[9px] text-slate-500 uppercase", children: "DIMENSIONS" }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-slate-300", children: payload.rect ? `${Math.round(payload.rect.width)} x ${Math.round(payload.rect.height)} px` : '-' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-2 bg-surface-lighter/20 rounded", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[9px] text-slate-500 uppercase", children: "ARIA-ROLE" }), (0, jsx_runtime_1.jsx)("div", { className: "text-[11px] text-slate-300", children: payload.attributes?.role || '-' })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-[11px] font-bold text-slate-400 uppercase mb-2", children: "Quick Assertions" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("button", { className: "w-full flex items-center justify-between p-2 rounded bg-surface-lighter/30 hover:bg-surface-lighter/50 transition-colors group", onClick: () => handleAddAssertion('toBeVisible'), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 12, className: "text-slate-400 group-hover:text-white" }), (0, jsx_runtime_1.jsx)("span", { className: "text-[11px] text-slate-300 group-hover:text-white", children: "Assert Visible" })] }), (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 12, className: "text-slate-500 opacity-0 group-hover:opacity-100" })] }), payload.innerText && ((0, jsx_runtime_1.jsxs)("button", { className: "w-full flex items-center justify-between p-2 rounded bg-surface-lighter/30 hover:bg-surface-lighter/50 transition-colors group", onClick: () => handleAddAssertion('toHaveText', payload.innerText), children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Type, { size: 12, className: "text-slate-400 group-hover:text-white" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] text-slate-300 group-hover:text-white truncate max-w-[180px]", children: ["Assert Text \"", payload.innerText.slice(0, 20), "...\""] })] }), (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 12, className: "text-slate-500 opacity-0 group-hover:opacity-100" })] }))] })] }), (0, jsx_runtime_1.jsxs)("button", { className: "w-full py-2 bg-primary text-white text-xs font-bold rounded shadow-lg shadow-primary/20 hover:bg-primary-hover active:translate-y-0.5 transition-all flex items-center justify-center gap-2", onClick: () => handleGenerateStep('click'), children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Play, { size: 14 }), "Generate Test Step"] })] })] }));
};
exports.InspectorSidebar = InspectorSidebar;
//# sourceMappingURL=InspectorSidebar.js.map