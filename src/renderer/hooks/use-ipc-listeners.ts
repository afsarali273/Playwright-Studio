/**
 * useIpcListeners hook
 * Subscribes to all IPC events from the main process and
 * updates the appropriate Zustand stores.
 */

import { useEffect } from 'react';
import { useStepsStore } from '../stores/steps-store';
import { useRecorderStore } from '../stores/recorder-store';
import { useRunnerStore } from '../stores/runner-store';
import { useLogsStore } from '../stores/logs-store';
import { useUIStore } from '../stores/ui-store';

/**
 * Call once in the root App component. Sets up all IPC listeners
 * and cleans them up on unmount.
 */
export function useIpcListeners(): void {
  const addStep = useStepsStore((s) => s.addStep);
  const setStepStatus = useStepsStore((s) => s.setStepStatus);
  const setActiveStep = useStepsStore((s) => s.setActiveStep);

  const setRecording = useRecorderStore((s) => s.setRecording);
  const setPaused = useRecorderStore((s) => s.setPaused);
  const setCurrentUrl = useRecorderStore((s) => s.setCurrentUrl);

  const setRunnerStatus = useRunnerStore((s) => s.setStatus);
  const setRunnerStepId = useRunnerStore((s) => s.setCurrentStepId);
  const setProgress = useRunnerStore((s) => s.setProgress);

  const addLog = useLogsStore((s) => s.addLog);

  const setBrowserUrl = useUIStore((s) => s.setBrowserUrl);
  const setBrowserTitle = useUIStore((s) => s.setBrowserTitle);
  const setInspectorPayload = useUIStore((s) => s.setInspectorPayload);
  const setInspectorModalOpen = useUIStore((s) => s.setInspectorModalOpen);

  useEffect(() => {
    /* Guard: only run in Electron environment */
    if (typeof window === 'undefined' || !window.electronAPI) return;

    const api = window.electronAPI;

    const unsubs: Array<() => void> = [];

    /* Recorder status updates */
    unsubs.push(
      api.onRecorderStatus((data) => {
        setRecording(data.recording);
        if (data.paused !== undefined) setPaused(data.paused);
        if (data.url) setCurrentUrl(data.url);
      })
    );

    /* New step recorded */
    unsubs.push(
      api.onStepAdded((step) => {
        addStep(step);
      })
    );

    /* Runner status */
    unsubs.push(
      api.onRunnerStatus((data) => {
        setRunnerStatus(data.status);
        if (data.currentStepId) {
          setRunnerStepId(data.currentStepId);
          setActiveStep(data.currentStepId);
        }
        if (data.progress) setProgress(data.progress);
      })
    );

    /* Runner step result */
    unsubs.push(
      api.onRunnerStepUpdate((data) => {
        setStepStatus(data.stepId, data.status, data.error);
      })
    );

    /* Logs */
    unsubs.push(
      api.onLogEvent((entry) => {
        addLog(entry);
      })
    );

    /* Browser navigated */
    unsubs.push(
      api.onBrowserNavigated((data) => {
        setBrowserUrl(data.url);
        setBrowserTitle(data.title);
      })
    );

    /* Inspector pick */
    unsubs.push(
      api.onInspectorPick((payload) => {
        setInspectorPayload(payload);
        setInspectorModalOpen(true);
      })
    );

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [
    addStep,
    setStepStatus,
    setActiveStep,
    setRecording,
    setCurrentUrl,
    setRunnerStatus,
    setRunnerStepId,
    setProgress,
    addLog,
    setBrowserUrl,
    setBrowserTitle,
  ]);
}
