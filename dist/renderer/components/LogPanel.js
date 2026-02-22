"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * LogPanel component
 * Right panel showing real-time logs, errors, and debug information.
 */
const react_1 = require("react");
const logs_store_1 = require("../stores/logs-store");
const ui_store_1 = require("../stores/ui-store");
const steps_store_1 = require("../stores/steps-store");
const lucide_react_1 = require("lucide-react");
const LogPanel = () => {
    const logs = (0, logs_store_1.useLogsStore)((s) => s.logs);
    const logsCollapsed = (0, ui_store_1.useUIStore)((s) => s.logsCollapsed);
    const toggleLogsCollapsed = (0, ui_store_1.useUIStore)((s) => s.toggleLogsCollapsed);
    const steps = (0, steps_store_1.useStepsStore)((s) => s.steps);
    const [generatedCode, setGeneratedCode] = (0, react_1.useState)('');
    const [copied, setCopied] = (0, react_1.useState)(false);
    // Auto-generate code when steps change
    (0, react_1.useEffect)(() => {
        let mounted = true;
        const updateCode = async () => {
            if (!window.electronAPI)
                return;
            try {
                const code = await window.electronAPI.exportScript();
                if (mounted)
                    setGeneratedCode(code);
            }
            catch (e) {
                console.error(e);
            }
        };
        updateCode();
        // Debounce or just run on steps change
        const timeout = setTimeout(updateCode, 500);
        return () => { mounted = false; clearTimeout(timeout); };
    }, [steps]);
    const handleCopy = (0, react_1.useCallback)(async () => {
        if (generatedCode) {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [generatedCode]);
    if (logsCollapsed)
        return null;
    return ((0, jsx_runtime_1.jsx)("aside", { className: "w-[480px] bg-surface-dark border-l border-border-dark flex flex-col flex-shrink-0 z-20 shadow-xl right-panel-transition", id: "right-sidebar", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-border-dark relative", children: [(0, jsx_runtime_1.jsx)("button", { className: "absolute -left-3 top-20 bg-surface-dark border border-border-dark text-slate-400 hover:text-white rounded-full p-1 shadow-lg z-50 lg:hidden", onClick: toggleLogsCollapsed, children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 12 }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Terminal, { size: 14, className: "text-primary" }), "Generated Code"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { className: "text-slate-500 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Undo, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { className: "text-slate-500 hover:text-white", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Redo, { size: 14 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 mb-4", children: [(0, jsx_runtime_1.jsx)("div", { className: "relative flex-1", children: (0, jsx_runtime_1.jsxs)("select", { className: "w-full bg-surface-lighter text-[10px] text-slate-300 border border-border-dark rounded p-1 appearance-none outline-none", children: [(0, jsx_runtime_1.jsx)("option", { children: "TypeScript (Playwright)" }), (0, jsx_runtime_1.jsx)("option", { disabled: true, children: "Python (Coming Soon)" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] text-slate-400", children: "Cucumber BDD" }), (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-4 bg-slate-700 rounded-full relative cursor-not-allowed", children: (0, jsx_runtime_1.jsx)("div", { className: "absolute left-0.5 top-0.5 w-3 h-3 bg-slate-500 rounded-full" }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { className: "flex-1 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Square, { size: 14 }), " Stop"] }), (0, jsx_runtime_1.jsxs)("button", { className: "flex-1 py-1.5 rounded bg-surface-lighter border border-border-dark text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-surface-lighter/80 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pause, { size: 14 }), " Pause"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-border-dark overflow-y-auto max-h-64 flex-shrink-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4", children: "Recorded Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-4 font-mono text-[10px]", children: [logs.filter(l => l.source === 'recorder').slice(-10).map((log, i) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 text-slate-500", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-1 h-1 bg-slate-600 rounded-full mt-1.5" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Action ", (0, jsx_runtime_1.jsx)("span", { className: "ml-2 text-slate-600", children: new Date(log.timestamp).toLocaleTimeString() })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-slate-400", children: log.message })] })] }, log.id))), logs.length === 0 && (0, jsx_runtime_1.jsx)("div", { className: "text-slate-600 italic", children: "No actions recorded yet." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 bg-[#1e2029] flex flex-col min-h-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-3 border-b border-border-dark flex justify-between items-center bg-surface-dark/50", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] text-slate-500 font-mono", children: "tests/test.spec.ts" }), (0, jsx_runtime_1.jsxs)("button", { className: "text-[10px] text-primary flex items-center gap-1 hover:text-white transition-colors", onClick: handleCopy, children: [copied ? (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 12 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 12 }), copied ? 'Copied' : 'Copy'] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-auto whitespace-pre", children: generatedCode || '// No code generated yet' })] })] }) }));
};
exports.LogPanel = LogPanel;
//# sourceMappingURL=LogPanel.js.map