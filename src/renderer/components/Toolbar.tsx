/**
 * Toolbar component
 * Top bar with Record, Stop, Run, Export, and URL navigation controls.
 */

import React, { useState, useCallback, type KeyboardEvent } from 'react';
import { useRecorderStore } from '../stores/recorder-store';
import { useRunnerStore } from '../stores/runner-store';
import { useStepsStore } from '../stores/steps-store';
import { useUIStore } from '../stores/ui-store';
import {
  Circle,
  Square,
  Play,
  SkipForward,
  StepForward,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Pause,
  Bug,
  Crosshair,
  CheckCircle,
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const isRecording = useRecorderStore((s) => s.isRecording);
  const isPaused = useRecorderStore((s) => s.isPaused);
  const runnerStatus = useRunnerStore((s) => s.status);
  const selectedStepId = useStepsStore((s) => s.selectedStepId);
  const browserUrl = useUIStore((s) => s.browserUrl);
  const logsCollapsed = useUIStore((s) => s.logsCollapsed);
  const toggleLogsCollapsed = useUIStore((s) => s.toggleLogsCollapsed);

  // We move urlInput to local state but it is actually handled in BrowserHeader now
  // So we don't need it here. But for now, let's just keep the handlers if we need them,
  // or move them.
  // Ideally Toolbar is just the top bar.
  
  const isRunning = runnerStatus === 'running';
  const inspectorEnabled = useUIStore((s) => s.inspectorEnabled);
  const assertionMode = useUIStore((s) => s.assertionMode);

  const [viewport, setViewport] = useState('1280x720');

  const handleViewportChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setViewport(value);
    if (!window.electronAPI) return;

    const [width, height] = value.split('x').map(Number);
    if (width && height) {
      console.log('Viewport changed to:', width, height);
      // In a real implementation, we would send this to the main process
      // to resize the BrowserView or enable emulation via CDP.
    }
  }, []);

  /* ----------- Handlers ----------- */

  const handleRecord = useCallback(async () => {
    if (!window.electronAPI) return;
    if (isRecording) {
      await window.electronAPI.stopRecording();
      useUIStore.getState().setInspectorEnabled(false);
      useUIStore.getState().setAssertionMode(false);
    } else {
      const url = browserUrl || undefined;
      await window.electronAPI.startRecording(url);
    }
  }, [isRecording, browserUrl]);

  const handlePause = useCallback(async () => {
    if (!window.electronAPI) return;
    if (isPaused) {
      await window.electronAPI.resumeRecording();
    } else {
      await window.electronAPI.pauseRecording();
    }
  }, [isPaused]);

  const handleInspect = useCallback(async () => {
    if (!window.electronAPI) return;
    if (inspectorEnabled) {
      await window.electronAPI.inspectStop();
      useUIStore.getState().setInspectorEnabled(false);
    } else {
      if (assertionMode) {
          useUIStore.getState().setAssertionMode(false);
      }
      await window.electronAPI.inspectStart();
      useUIStore.getState().setInspectorEnabled(true);
    }
  }, [inspectorEnabled, assertionMode]);

  const handleAssert = useCallback(async () => {
    if (!window.electronAPI) return;
    if (assertionMode) {
      await window.electronAPI.inspectStop();
      useUIStore.getState().setAssertionMode(false);
    } else {
      if (inspectorEnabled) {
        useUIStore.getState().setInspectorEnabled(false);
      }
      await window.electronAPI.inspectStart();
      useUIStore.getState().setAssertionMode(true);
    }
  }, [assertionMode, inspectorEnabled]);

  const handleStop = useCallback(async () => {
    if (!window.electronAPI) return;
    if (isRecording) await window.electronAPI.stopRecording();
    if (isRunning) await window.electronAPI.stopRunner();
    
    await window.electronAPI.inspectStop();
    useUIStore.getState().setInspectorEnabled(false);
    useUIStore.getState().setAssertionMode(false);
  }, [isRecording, isRunning]);

  const handleRunAll = useCallback(async () => {
    if (!window.electronAPI) return;
    useStepsStore.getState().resetAllStatuses();
    await window.electronAPI.runAll();
  }, []);

  const handleRunFrom = useCallback(async () => {
    if (!window.electronAPI || !selectedStepId) return;
    await window.electronAPI.runFrom(selectedStepId);
  }, [selectedStepId]);

  const handleRunStep = useCallback(async () => {
    if (!window.electronAPI || !selectedStepId) return;
    await window.electronAPI.runStep(selectedStepId);
  }, [selectedStepId]);

  const handleExport = useCallback(async () => {
    if (!window.electronAPI) return;
    const code = await window.electronAPI.exportScript();
    useUIStore.getState().setExportedCode(code);
    useUIStore.getState().setExportModalOpen(true);
  }, []);

  /* ----------- Render ----------- */

  return (
    <div className="h-8 bg-surface-dark w-full flex items-center justify-between px-4 border-b border-border-dark select-none" style={{ WebkitAppRegion: 'drag' } as any}>
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
          <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
        </div>
        <div className="ml-4 flex items-center gap-4">
          <button 
            className={`flex items-center gap-1.5 text-xs ${isRecording ? 'text-white' : 'text-slate-300'} hover:text-white transition-colors`}
            onClick={handleRecord}
          >
            <span className={`material-symbols-outlined text-sm ${isRecording ? 'text-red-500' : ''}`}>radio_button_checked</span>
            {isRecording ? 'Recording' : 'Record'}
          </button>
          
          <button 
            className={`text-xs ${isPaused ? 'text-yellow-400' : 'text-slate-400'} hover:text-white`}
            onClick={handlePause}
            disabled={!isRecording}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button 
            className="text-xs text-slate-400 hover:text-white"
            onClick={handleStop}
            disabled={!isRecording && !isRunning}
          >
            Stop
          </button>
          
          <button 
            className={`text-xs ${inspectorEnabled ? 'text-white' : 'text-slate-400'} hover:text-white`}
            onClick={handleInspect}
          >
            Inspect
          </button>
          
          {/* Assert button is less needed if Inspect mode has quick assertions, but let's keep it for now */}
          {/* <button 
            className={`text-xs ${assertionMode ? 'text-white' : 'text-slate-400'} hover:text-white`}
            onClick={handleAssert}
            disabled={!isRecording}
          >
            Assert
          </button> */}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded text-xs font-bold disabled:opacity-50"
          onClick={handleRunAll}
          disabled={isRunning || isRecording}
        >
          <span className="material-symbols-outlined text-sm">play_arrow</span>
          Run All
        </button>
        
        <button 
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
          onClick={handleRunFrom}
          disabled={isRunning || !selectedStepId}
        >
          <span className="material-symbols-outlined text-sm">skip_next</span>
          Run From
        </button>
        
        <button 
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
          onClick={handleRunStep}
          disabled={isRunning || !selectedStepId}
        >
          <span className="material-symbols-outlined text-sm">redo</span>
          Run Step
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          className="text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-white/10 transition-colors" 
          onClick={toggleLogsCollapsed} 
          title="Toggle Code Panel"
        >
          <span className="material-symbols-outlined text-sm">side_navigation</span>
        </button>
        
        <button 
          className="text-slate-400 hover:text-white" 
          onClick={handleExport}
          title="Export"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
        </button>
        
        <div className="h-4 w-[1px] bg-border-dark mx-1"></div>
        
        <select 
          className="bg-transparent text-[10px] text-slate-400 border-none focus:ring-0 p-0 cursor-pointer outline-none"
          value={viewport}
          onChange={handleViewportChange}
        >
          <option value="1280x720">Laptop (1280x720)</option>
          <option value="1920x1080">Desktop (1920x1080)</option>
          <option value="375x667">Mobile (375x667)</option>
        </select>
      </div>
    </div>
  );
};
