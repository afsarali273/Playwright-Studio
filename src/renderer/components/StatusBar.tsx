/**
 * StatusBar component
 * Bottom bar showing runner progress, project info, and recording status.
 */

import React from 'react';
import { useRunnerStore } from '../stores/runner-store';
import { useRecorderStore } from '../stores/recorder-store';
import { useStepsStore } from '../stores/steps-store';

export const StatusBar: React.FC = () => {
  const runnerStatus = useRunnerStore((s) => s.status);
  const progress = useRunnerStore((s) => s.progress);
  const isRecording = useRecorderStore((s) => s.isRecording);
  const steps = useStepsStore((s) => s.steps);

  const passedCount = steps.filter((s) => s.status === 'passed').length;
  const failedCount = steps.filter((s) => s.status === 'failed').length;

  return (
    <footer className="status-bar" role="status" aria-live="polite">
      <div className="status-bar__left">
        {isRecording && (
          <span className="status-bar__recording">
            Recording...
          </span>
        )}
        {runnerStatus === 'running' && (
          <span className="status-bar__running">
            Running: {progress.completed}/{progress.total}
          </span>
        )}
        {runnerStatus === 'paused' && (
          <span className="status-bar__paused">Paused</span>
        )}
        {runnerStatus === 'idle' && !isRecording && (
          <span className="status-bar__idle">Ready</span>
        )}
      </div>

      <div className="status-bar__right">
        <span className="status-bar__stat">
          Steps: {steps.length}
        </span>
        {passedCount > 0 && (
          <span className="status-bar__stat status-bar__stat--passed">
            Passed: {passedCount}
          </span>
        )}
        {failedCount > 0 && (
          <span className="status-bar__stat status-bar__stat--failed">
            Failed: {failedCount}
          </span>
        )}
      </div>
    </footer>
  );
};
