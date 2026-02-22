import React, { useMemo } from 'react';
import { useStepsStore } from '../stores/steps-store';
import { useLogsStore } from '../stores/logs-store';
import { ACTION_LABELS } from '../../shared/constants';
import type { TestStep, LogEntry } from '../../shared/types';

type StepMeta = {
  tagName?: string;
  innerText?: string;
  attributes?: Record<string, string>;
};

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDuration(startTs: number, nowTs: number) {
  const ms = Math.max(0, nowTs - startTs);
  if (ms < 1000) return `${ms} ms`;
  const s = ms / 1000;
  return `${s.toFixed(1)} s`;
}

function getStatusClass(status: TestStep['status']) {
  if (status === 'passed') return 'action-details__status action-details__status--passed';
  if (status === 'failed') return 'action-details__status action-details__status--failed';
  if (status === 'running') return 'action-details__status action-details__status--running';
  if (status === 'skipped') return 'action-details__status action-details__status--skipped';
  return 'action-details__status action-details__status--idle';
}

export const ActionDetailsPanel: React.FC = () => {
  const steps = useStepsStore((s) => s.steps);
  const selectedStepId = useStepsStore((s) => s.selectedStepId);
  const activeStepId = useStepsStore((s) => s.activeStepId);
  const logs = useLogsStore((s) => s.logs);

  const step = useMemo(() => {
    if (!steps.length) return null;
    if (selectedStepId) {
      const found = steps.find((s) => s.id === selectedStepId);
      if (found) return found;
    }
    if (activeStepId) {
      const found = steps.find((s) => s.id === activeStepId);
      if (found) return found;
    }
    return steps[steps.length - 1] ?? null;
  }, [steps, selectedStepId, activeStepId]);

  const nowTs = Date.now();

  const relatedLogs = useMemo<LogEntry[]>(() => {
    if (!step) return [];
    const byStepId = logs.filter((entry) => entry.stepId === step.id);
    if (byStepId.length > 0) {
      return byStepId.slice(-5);
    }
    const key = step.selector || step.description || step.action;
    if (!key) return [];
    return logs.filter((entry) => entry.message.includes(key)).slice(-5);
  }, [logs, step]);

  if (!step) {
    return (
      <div className="action-details action-details--empty">
        <p className="action-details__empty-text">Select a step to see action details.</p>
      </div>
    );
  }

  const label = ACTION_LABELS[step.action] ?? step.action;
  const meta = (step.meta ?? {}) as StepMeta;
  const attrs = meta.attributes ?? {};

  const primarySelector = step.selector;

  return (
    <div className="action-details">
      <div className="action-details__header">
        <div className="action-details__title-row">
          <span className="action-details__action-label">{label}</span>
          <span className={getStatusClass(step.status)}>{step.status}</span>
        </div>
        {primarySelector && (
          <div className="action-details__selector">
            <span className="action-details__selector-label">Selector</span>
            <code className="action-details__selector-value">{primarySelector}</code>
          </div>
        )}
        <div className="action-details__meta-row">
          <span className="action-details__meta-item">
            Time {formatTime(step.timestamp)}
          </span>
          <span className="action-details__meta-separator">•</span>
          <span className="action-details__meta-item">
            Duration {formatDuration(step.timestamp, nowTs)}
          </span>
        </div>
      </div>

      {step.value && (
        <div className="action-details__section">
          <div className="action-details__section-label">Value</div>
          <code className="action-details__code">{step.value}</code>
        </div>
      )}

      {(meta.tagName || meta.innerText || Object.keys(attrs).length > 0) && (
        <div className="action-details__section">
          <div className="action-details__section-label">Element</div>
          <div className="action-details__element">
            {meta.tagName && (
              <div className="action-details__row">
                <span className="action-details__key">Tag</span>
                <span className="action-details__value">{meta.tagName}</span>
              </div>
            )}
            {meta.innerText && (
              <div className="action-details__row">
                <span className="action-details__key">Text</span>
                <span className="action-details__value">{meta.innerText}</span>
              </div>
            )}
            {Object.keys(attrs).length > 0 && (
              <div className="action-details__attributes">
                {Object.entries(attrs).map(([name, value]) => (
                  <div key={name} className="action-details__row">
                    <span className="action-details__key">{name}</span>
                    <span className="action-details__value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step.error && (
        <div className="action-details__section">
          <div className="action-details__section-label">Error</div>
          <div className="action-details__error">
            <pre className="action-details__error-text">{step.error}</pre>
          </div>
        </div>
      )}

      {relatedLogs.length > 0 && (
        <div className="action-details__section">
          <div className="action-details__section-label">Logs</div>
          <div className="action-details__logs">
            {relatedLogs.map((entry) => (
              <div key={entry.id} className="action-details__log-row">
                <span className="action-details__log-time">
                  {formatTime(entry.timestamp)}
                </span>
                <span className="action-details__log-message">
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
