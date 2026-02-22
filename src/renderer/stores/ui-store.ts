/**
 * Zustand store: UI
 * Controls layout panels, modals, and UI-specific state.
 */

import { create } from 'zustand';
import type { InspectorPayload } from '../../shared/types';

export type ScriptLanguage = 'typescript' | 'java';

interface UIState {
  leftPanelWidth: number;
  rightPanelWidth: number;
  exportModalOpen: boolean;
  exportedCode: string;
  exportLanguage: ScriptLanguage;
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
  setExportLanguage: (lang: ScriptLanguage) => void;
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

export const useUIStore = create<UIState>((set, get) => ({
  leftPanelWidth: 22,
  rightPanelWidth: 22,
  exportModalOpen: false,
  exportedCode: '',
  exportLanguage: 'typescript',
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
  setExportLanguage: (lang) => set({ exportLanguage: lang }),
  setUrlBarFocused: (focused) => set({ urlBarFocused: focused }),
  setBrowserUrl: (url) => set({ browserUrl: url }),
  setBrowserTitle: (title) => set({ browserTitle: title }),
  setLogsCollapsed: (collapsed) => set({ logsCollapsed: collapsed }),
  toggleLogsCollapsed: () =>
    set({
      logsCollapsed: !get().logsCollapsed,
    }),
  setInspectorEnabled: (enabled) => set({ inspectorEnabled: enabled }),
  setAssertionMode: (enabled) => set({ assertionMode: enabled }),
  setInspectorModalOpen: (open) => set({ inspectorModalOpen: open }),
  setInspectorPayload: (payload) => set({ inspectorPayload: payload }),
}));
