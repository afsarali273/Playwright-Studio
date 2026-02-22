"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Toolbar_1 = require("./Toolbar");
const StepList_1 = require("./StepList");
const BrowserPanel_1 = require("./BrowserPanel");
const LogPanel_1 = require("./LogPanel");
const InspectorSidebar_1 = require("./InspectorSidebar");
const ExportModal_1 = require("./ExportModal");
const use_ipc_listeners_1 = require("../hooks/use-ipc-listeners");
const ui_store_1 = require("../stores/ui-store");
const App = () => {
    /* Subscribe to all IPC events from main process */
    (0, use_ipc_listeners_1.useIpcListeners)();
    const inspectorEnabled = (0, ui_store_1.useUIStore)((s) => s.inspectorEnabled);
    const assertionMode = (0, ui_store_1.useUIStore)((s) => s.assertionMode);
    const showInspector = inspectorEnabled || assertionMode;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col h-screen overflow-hidden bg-background-dark text-slate-100 font-display", children: [(0, jsx_runtime_1.jsx)(Toolbar_1.Toolbar, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-1 overflow-hidden", id: "main-layout-container", children: [(0, jsx_runtime_1.jsx)(StepList_1.StepList, {}), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 flex flex-col bg-background-dark min-w-0 relative right-panel-transition", children: (0, jsx_runtime_1.jsx)(BrowserPanel_1.BrowserPanel, {}) }), showInspector ? (0, jsx_runtime_1.jsx)(InspectorSidebar_1.InspectorSidebar, {}) : (0, jsx_runtime_1.jsx)(LogPanel_1.LogPanel, {})] }), (0, jsx_runtime_1.jsx)(ExportModal_1.ExportModal, {})] }));
};
exports.App = App;
//# sourceMappingURL=App.js.map