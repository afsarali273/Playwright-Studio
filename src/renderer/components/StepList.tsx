/**
 * StepList component
 * Left panel displaying all recorded test steps with status indicators.
 * Supports selection, deletion, and drag-to-reorder.
 */

import React, { useCallback } from 'react';
import { useStepsStore } from '../stores/steps-store';
import { useRunnerStore } from '../stores/runner-store';
import { ACTION_LABELS } from '../../shared/constants';
import type { TestStep, SelectorCandidate } from '../../shared/types';
import {
  MousePointerClick,
  Type,
  Navigation,
  Keyboard,
  CheckSquare,
  Eye,
  Trash2,
  ChevronRight,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useUIStore } from '../stores/ui-store';

/* ---- Icon mapping for action types ---- */
function ActionIcon({ action, className }: { action: string; className?: string }) {
  const size = 14;
  switch (action) {
    case 'click':
    case 'dblclick':
      return <MousePointerClick size={size} className={className} />;
    case 'input':
    case 'change':
      return <Type size={size} className={className} />;
    case 'navigate':
      return <Navigation size={size} className={className} />;
    case 'keydown':
      return <Keyboard size={size} className={className} />;
    case 'check':
    case 'uncheck':
      return <CheckSquare size={size} className={className} />;
    case 'assert':
      return <Eye size={size} className={className} />;
    default:
      return <ChevronRight size={size} className={className} />;
  }
}

/* ---- Single step row ---- */
type StepMeta = {
  selectorCandidates?: SelectorCandidate[];
};

interface StepRowProps {
  step: TestStep;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const StepRow: React.FC<StepRowProps> = ({
  step,
  index,
  isSelected,
  isActive,
  onSelect,
  onDelete,
}) => {
  const meta = (step.meta ?? {}) as StepMeta;
  const candidates = meta.selectorCandidates ?? [];

  let selectorLabel = step.selector;
  let selectorStrategy: string | undefined;

  if (candidates.length > 0) {
    const primary =
      candidates.find((c) => c.value === step.selector) ?? candidates[0];
    if (primary) {
      selectorLabel = primary.value;
      selectorStrategy = primary.strategy;
    }
  }

  const handleCopy = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!text) return;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
      }
    }
  };

  return (
    <div className={`rounded transition-all ${isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-surface-lighter/30 border border-transparent hover:border-primary/30'}`}>
        <div
        className={`flex items-start gap-3 p-2 cursor-pointer relative group ${isActive ? 'ring-1 ring-yellow-500 rounded' : ''}`}
        onClick={() => onSelect(step.id)}
        >
        <span className="text-[10px] text-slate-500 mt-1">{index + 1}</span>
        
        <span className="mt-1">
            <ActionIcon action={step.action} className={isSelected ? 'text-primary' : 'text-slate-400'} />
        </span>

        <div className="flex-1 min-w-0">
            <div className={`text-xs font-bold ${isSelected ? 'text-slate-200' : 'text-slate-300'}`}>
            {ACTION_LABELS[step.action] || step.action}
            </div>
            <div className={`text-[10px] truncate font-mono mt-0.5 ${isSelected ? 'text-primary' : 'text-slate-500'}`} title={selectorLabel}>
            {selectorStrategy ? `[${selectorStrategy}] ` : ''}{selectorLabel}
            </div>
            {step.value && (
            <div className="text-[10px] text-green-400 font-mono truncate" title={step.value}>
                "{step.value}"
            </div>
            )}
        </div>

        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
            <button
                className="p-1 hover:text-white text-slate-400"
                onClick={(e) => handleCopy(e, selectorLabel)}
                title="Copy locator"
            >
                <Copy size={12} />
            </button>
            <button
                className="p-1 hover:text-red-400 text-slate-400"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(step.id);
                }}
                title="Delete step"
            >
                <Trash2 size={12} />
            </button>
        </div>
        </div>

        {/* Expanded Details */}
        {isSelected && candidates.length > 0 && (
            <div className="px-2 pb-2 pt-1 bg-black/20 mx-1 mb-1 rounded-b">
                <div className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5 pt-1">
                    <ChevronDown size={12} /> 
                    <span>Available Locators</span>
                </div>
                <div className="space-y-2">
                    {candidates.map((c, i) => {
                        const isHighConfidence = c.confidence >= 0.9;
                        const isMediumConfidence = c.confidence >= 0.7 && c.confidence < 0.9;
                        
                        return (
                            <div 
                                key={i} 
                                className="group/item relative flex flex-col gap-1 p-2 rounded bg-surface-dark border border-border-dark/50 hover:border-primary/30 hover:bg-surface-lighter/10 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{c.strategy}</span>
                                        {isHighConfidence && <span className="text-[9px] text-green-400 font-medium">Recommended</span>}
                                    </div>
                                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                        isHighConfidence ? 'bg-green-500/10 text-green-400' : 
                                        isMediumConfidence ? 'bg-yellow-500/10 text-yellow-400' : 
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                        {(c.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-[11px] font-mono text-slate-300 break-all leading-relaxed bg-black/20 p-1.5 rounded border border-white/5">
                                        {c.value}
                                    </code>
                                    <button 
                                        className="text-slate-500 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
                                        onClick={(e) => handleCopy(e, c.value)}
                                        title="Copy locator"
                                    >
                                        <Copy size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
  );
};

/* ---- Main StepList ---- */
export const StepList: React.FC = () => {
  const steps = useStepsStore((s) => s.steps);
  const selectedStepId = useStepsStore((s) => s.selectedStepId);
  const activeStepId = useRunnerStore((s) => s.currentStepId);

  const handleDelete = useCallback(async (stepId: string) => {
      useStepsStore.getState().deleteStep(stepId);
      if (window.electronAPI) {
        await window.electronAPI.deleteStep(stepId);
      }
    }, []);

  const handleClear = useCallback(async () => {
    useStepsStore.getState().clearSteps();
    if (window.electronAPI) {
      await window.electronAPI.clearSteps();
    }
  }, []);

  const handleSelect = useCallback((stepId: string) => {
    const currentSelected = useStepsStore.getState().selectedStepId;
    useStepsStore.getState().selectStep(currentSelected === stepId ? null : stepId);
  }, []);

  return (
    <aside className="w-64 flex flex-col bg-surface-dark border-r border-border-dark flex-shrink-0">
      <div className="p-3 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Steps</span>
          <span className="bg-slate-700 text-[10px] px-1.5 rounded text-slate-300">{steps.length}</span>
        </div>
        <button 
          className="text-[10px] text-slate-500 hover:text-slate-300 uppercase"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 space-y-1">
          {steps.map((step, idx) => (
              <StepRow
                key={step.id}
                step={step}
                index={idx}
                isSelected={step.id === selectedStepId}
                isActive={step.id === activeStepId}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
          ))}
          {steps.length === 0 && (
             <div className="p-4 text-center text-slate-500 text-xs">
                No steps recorded. <br/> Click Record to start.
             </div>
          )}
        </div>
      </div>
    </aside>
  );
};
