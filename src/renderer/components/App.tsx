/**
 * App component -- root of the Electron renderer.
 * Assembles the four-panel layout: Toolbar (top), StepList (left),
 * BrowserPanel (center), LogPanel (right), StatusBar (bottom).
 */

import React from 'react';
import { Toolbar } from './Toolbar';
import { StepList } from './StepList';
import { BrowserPanel } from './BrowserPanel';
import { LogPanel } from './LogPanel';
import { InspectorSidebar } from './InspectorSidebar';
import { ExportModal } from './ExportModal';
import { useIpcListeners } from '../hooks/use-ipc-listeners';
import { useUIStore } from '../stores/ui-store';

export const App: React.FC = () => {
  /* Subscribe to all IPC events from main process */
  useIpcListeners();
  
  const inspectorEnabled = useUIStore((s) => s.inspectorEnabled);
  const assertionMode = useUIStore((s) => s.assertionMode);
  
  const showInspector = inspectorEnabled || assertionMode;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-slate-100 font-display">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden" id="main-layout-container">
        <StepList />
        
        <main className="flex-1 flex flex-col bg-background-dark min-w-0 relative right-panel-transition">
          <BrowserPanel />
        </main>

        {showInspector ? <InspectorSidebar /> : <LogPanel />}
      </div>

      <ExportModal />
    </div>
  );
};
