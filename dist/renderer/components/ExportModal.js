"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModal = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * ExportModal component
 * Shows generated Playwright code with syntax highlighting via a
 * simple monospace pre block (Monaco is available for advanced editing).
 */
const react_1 = require("react");
const ui_store_1 = require("../stores/ui-store");
const lucide_react_1 = require("lucide-react");
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const ExportModal = () => {
    const isOpen = (0, ui_store_1.useUIStore)((s) => s.exportModalOpen);
    const code = (0, ui_store_1.useUIStore)((s) => s.exportedCode);
    const setOpen = (0, ui_store_1.useUIStore)((s) => s.setExportModalOpen);
    const [copied, setCopied] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!window.electronAPI)
            return;
        if (isOpen) {
            // Hide the browser view so the modal appears on top
            window.electronAPI.hideBrowserView();
        }
        else {
            // Show it again when closed
            window.electronAPI.showBrowserView();
        }
        return () => {
            if (isOpen && window.electronAPI) {
                window.electronAPI.showBrowserView();
            }
        };
    }, [isOpen]);
    const handleClose = () => {
        setOpen(false);
    };
    const handleCopy = (0, react_1.useCallback)(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
        catch {
            console.error('Failed to copy');
        }
    }, [code]);
    const handleDownload = (0, react_1.useCallback)(() => {
        const blob = new Blob([code], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-test.spec.ts';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [code]);
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200", children: (0, jsx_runtime_1.jsxs)("div", { className: "w-[800px] h-[600px] bg-surface-dark border border-border-dark rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-border-dark bg-surface-lighter/10", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "p-2 bg-primary/10 rounded-lg", children: (0, jsx_runtime_1.jsx)(lucide_react_1.FileText, { size: 20, className: "text-primary" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-bold text-white", children: "Export Test Script" }), (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] text-slate-400", children: "Generated Playwright TypeScript code" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: handleCopy, className: `flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${copied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-surface-lighter hover:bg-surface-lighter/80 text-slate-300 border border-border-dark'}`, children: [copied ? (0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 14 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 14 }), copied ? 'Copied!' : 'Copy Code'] }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleDownload, className: "flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-medium transition-colors shadow-lg shadow-primary/20", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 14 }), "Download .ts"] }), (0, jsx_runtime_1.jsx)("div", { className: "w-[1px] h-6 bg-border-dark mx-2" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 18 }) })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 overflow-hidden relative group", children: (0, jsx_runtime_1.jsx)("div", { className: "absolute inset-0 overflow-auto custom-scrollbar bg-[#1e1e1e]", children: (0, jsx_runtime_1.jsx)(react_syntax_highlighter_1.Prism, { language: "typescript", style: prism_1.vscDarkPlus, customStyle: {
                                margin: 0,
                                padding: '1.5rem',
                                fontSize: '12px',
                                lineHeight: '1.5',
                                background: 'transparent',
                                fontFamily: '"JetBrains Mono", monospace'
                            }, showLineNumbers: true, lineNumberStyle: {
                                minWidth: '3em',
                                paddingRight: '1em',
                                color: '#6e7681',
                                textAlign: 'right'
                            }, children: code }) }) }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 border-t border-border-dark bg-surface-lighter/5 flex justify-between items-center text-[10px] text-slate-500", children: [(0, jsx_runtime_1.jsx)("span", { children: "Playwright v1.42.0 Compatible" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-4", children: [(0, jsx_runtime_1.jsx)("span", { children: "TypeScript" }), (0, jsx_runtime_1.jsx)("span", { children: "UTF-8" })] })] })] }) }));
};
exports.ExportModal = ExportModal;
//# sourceMappingURL=ExportModal.js.map