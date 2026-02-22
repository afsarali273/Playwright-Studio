"use strict";
/**
 * Zustand store: UI
 * Controls layout panels, modals, and UI-specific state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUIStore = void 0;
const zustand_1 = require("zustand");
exports.useUIStore = (0, zustand_1.create)((set, get) => ({
    leftPanelWidth: 22,
    rightPanelWidth: 22,
    exportModalOpen: false,
    exportedCode: '',
    urlBarFocused: false,
    browserUrl: '',
    browserTitle: '',
    logsCollapsed: false,
    inspectorEnabled: false,
    assertionMode: false,
    inspectorModalOpen: false,
    inspectorPayload: null,
    setLeftPanelWidth: (w) => set({ leftPanelWidth: w }),
    setRightPanelWidth: (w) => set({ rightPanelWidth: w }),
    setExportModalOpen: (open) => set({ exportModalOpen: open }),
    setExportedCode: (code) => set({ exportedCode: code }),
    setUrlBarFocused: (focused) => set({ urlBarFocused: focused }),
    setBrowserUrl: (url) => set({ browserUrl: url }),
    setBrowserTitle: (title) => set({ browserTitle: title }),
    setLogsCollapsed: (collapsed) => set({ logsCollapsed: collapsed }),
    toggleLogsCollapsed: () => set({
        logsCollapsed: !get().logsCollapsed,
    }),
    setInspectorEnabled: (enabled) => set({ inspectorEnabled: enabled }),
    setAssertionMode: (enabled) => set({ assertionMode: enabled }),
    setInspectorModalOpen: (open) => set({ inspectorModalOpen: open }),
    setInspectorPayload: (payload) => set({ inspectorPayload: payload }),
}));
//# sourceMappingURL=ui-store.js.map