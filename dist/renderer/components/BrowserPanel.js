"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * BrowserPanel component
 * Center panel that hosts the embedded browser viewport.
 * In Electron, the actual browser is a BrowserView overlaid on this region.
 * This component reports its bounding rect so the main process can position it.
 */
const react_1 = require("react");
const recorder_store_1 = require("../stores/recorder-store");
const ui_store_1 = require("../stores/ui-store");
const BrowserPanel = () => {
    const containerRef = (0, react_1.useRef)(null);
    const isRecording = (0, recorder_store_1.useRecorderStore)((s) => s.isRecording);
    const browserUrl = (0, ui_store_1.useUIStore)((s) => s.browserUrl);
    const [urlInput, setUrlInput] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        setUrlInput(browserUrl);
    }, [browserUrl]);
    const handleNavigate = (0, react_1.useCallback)(async (e) => {
        if (e.key === 'Enter' && urlInput.trim()) {
            if (!window.electronAPI)
                return;
            let url = urlInput.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            await window.electronAPI.navigateTo(url);
            setUrlInput(url);
        }
    }, [urlInput]);
    const handleReload = (0, react_1.useCallback)(async () => {
        if (!window.electronAPI)
            return;
        await window.electronAPI.reloadBrowser();
    }, []);
    /**
     * Report the bounding rect of this container to the main process
     * so it can position the BrowserView exactly on top.
     */
    const reportBounds = (0, react_1.useCallback)(() => {
        if (!containerRef.current || !window.electronAPI)
            return;
        const rect = containerRef.current.getBoundingClientRect();
        window.electronAPI.setBrowserBounds({
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        });
    }, []);
    (0, react_1.useEffect)(() => {
        // Delay reporting to ensure layout is stable
        const timer = setTimeout(reportBounds, 100);
        const resizeObserver = new ResizeObserver(() => {
            reportBounds();
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', reportBounds);
        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            window.removeEventListener('resize', reportBounds);
        };
    }, [reportBounds]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col flex-1 h-full min-w-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "h-14 flex items-center gap-4 px-4 border-b border-border-dark bg-surface-dark flex-shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 px-2 py-1 bg-red-500 text-white rounded-t-md ml-4 mr-auto text-[10px] font-bold uppercase tracking-tighter", children: [isRecording ? 'REC' : 'IDLE', " ", (0, jsx_runtime_1.jsx)("span", { className: "text-white/80 font-normal ml-2", children: "Browser" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 mx-4 bg-background-dark rounded-full flex items-center px-4 py-1.5 border border-border-dark", children: [(0, jsx_runtime_1.jsx)("input", { className: "flex-1 text-xs text-slate-300 font-mono bg-transparent border-none focus:ring-0 p-0 outline-none", value: urlInput, onChange: (e) => setUrlInput(e.target.value), onKeyDown: handleNavigate, placeholder: "Enter URL..." }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 text-slate-500", children: [urlInput && ((0, jsx_runtime_1.jsx)("button", { onClick: () => setUrlInput(''), className: "hover:text-white", children: (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "close" }) })), (0, jsx_runtime_1.jsx)("button", { onClick: handleReload, className: "hover:text-white", title: "Reload", children: (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "refresh" }) }), (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-sm", children: "search" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 pr-4 text-slate-400", children: [(0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-lg", children: "settings" }), (0, jsx_runtime_1.jsx)("span", { className: "material-symbols-outlined text-lg", children: "apps" }), (0, jsx_runtime_1.jsx)("button", { className: "px-4 py-1 bg-slate-100 text-slate-900 rounded-full text-xs font-bold", children: "Sign in" })] })] }), (0, jsx_runtime_1.jsx)("div", { ref: containerRef, className: "flex-1 relative bg-[#1e2029] overflow-hidden", "data-testid": "browser-viewport", children: !window.electronAPI && ((0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center h-full text-slate-500", children: (0, jsx_runtime_1.jsx)("p", { children: "Embedded browser viewport" }) })) })] }));
};
exports.BrowserPanel = BrowserPanel;
//# sourceMappingURL=BrowserPanel.js.map