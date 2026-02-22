/**
 * Zustand store: UI
 * Controls layout panels, modals, and UI-specific state.
 */
import type { InspectorPayload } from '../../shared/types';
interface UIState {
    leftPanelWidth: number;
    rightPanelWidth: number;
    exportModalOpen: boolean;
    exportedCode: string;
    urlBarFocused: boolean;
    browserUrl: string;
    browserTitle: string;
    logsCollapsed: boolean;
    inspectorEnabled: boolean;
    assertionMode: boolean;
    inspectorModalOpen: boolean;
    inspectorPayload: InspectorPayload | null;
    setLeftPanelWidth: (w: number) => void;
    setRightPanelWidth: (w: number) => void;
    setExportModalOpen: (open: boolean) => void;
    setExportedCode: (code: string) => void;
    setUrlBarFocused: (focused: boolean) => void;
    setBrowserUrl: (url: string) => void;
    setBrowserTitle: (title: string) => void;
    setLogsCollapsed: (collapsed: boolean) => void;
    toggleLogsCollapsed: () => void;
    setInspectorEnabled: (enabled: boolean) => void;
    setAssertionMode: (enabled: boolean) => void;
    setInspectorModalOpen: (open: boolean) => void;
    setInspectorPayload: (payload: InspectorPayload | null) => void;
}
export declare const useUIStore: import("zustand").UseBoundStore<import("zustand").StoreApi<UIState>>;
export {};
//# sourceMappingURL=ui-store.d.ts.map