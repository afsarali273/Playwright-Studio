/**
 * InspectorPanel component
 * Shows details of the inspected element including locator candidates.
 * Replaces the LogPanel content when active.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useUIStore } from '../stores/ui-store';
import { X, Copy, Crosshair, Play, AlertCircle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const payload = useUIStore((s) => s.inspectorPayload);
  const setOpen = useUIStore((s) => s.setInspectorModalOpen);
  const setEnabled = useUIStore((s) => s.setInspectorEnabled);

  const [validatorValue, setValidatorValue] = useState('');
  const [validationResult, setValidationResult] = useState<{count: number, error?: string} | null>(null);

  const assertionMode = useUIStore((s) => s.assertionMode);
  const setAssertionMode = useUIStore((s) => s.setAssertionMode);

  // Assertion state
  const [selectedAssertion, setSelectedAssertion] = useState<'toBeVisible' | 'toHaveText' | 'toHaveValue' | 'toContainText' | 'toHaveAttribute' | 'toHaveCount'>('toBeVisible');
  const [assertionValue, setAssertionValue] = useState('');

  // Reset validator when payload changes
  useEffect(() => {
    setValidationResult(null);
    if (payload?.candidates && payload.candidates.length > 0) {
      const best = payload.candidates.find(c => 
        c.strategy === 'css' || 
        c.strategy === 'xpath' || 
        c.strategy === 'relative-xpath' || 
        c.strategy === 'complex-xpath'
      );
      if (best) {
        setValidatorValue(best.value);
      }
    }
    // Default assertion value based on element
    if (payload?.innerText) {
        setSelectedAssertion('toHaveText');
        setAssertionValue(payload.innerText);
    } else if (payload?.tagName === 'input' || payload?.tagName === 'textarea') {
        setSelectedAssertion('toHaveValue');
        setAssertionValue('');
    } else {
        setSelectedAssertion('toBeVisible');
        setAssertionValue('');
    }
  }, [payload]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEnabled(false);
    setAssertionMode(false);
    if (window.electronAPI) {
      window.electronAPI.inspectStop();
    }
  }, []);

  const handleCopy = async (text: string) => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
      } catch { }
    }
  };

  const handleValidate = async (val: string) => {
    if (!window.electronAPI || !val) return;
    if (val.includes('getBy') || val.includes('page.')) {
        setValidationResult({ count: 0, error: 'Only CSS/XPath supported for live check.' });
        return;
    }
    const result = await window.electronAPI.validateLocator(val);
    setValidationResult(result);
  };

  const handleAddAssertion = async () => {
    if (!window.electronAPI || !payload) return;
    const bestCandidate = payload.candidates.find(c => 
      c.strategy === 'css' || 
      c.strategy === 'xpath' || 
      c.strategy === 'relative-xpath' || 
      c.strategy === 'complex-xpath'
    ) || payload.candidates[0];

    if (!bestCandidate) return;

    const api = window.electronAPI as any;
    if (api.addAssertion) {
        await api.addAssertion({
            selector: bestCandidate.value,
            assertionType: selectedAssertion,
            assertionValue: assertionValue,
            timestamp: Date.now()
        });
        handleClose();
    }
  };

  if (!payload) {
    return (
      <div className="text-[10px] text-slate-500 italic p-2 text-center">
        Hover over an element to inspect...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-center text-[10px] text-slate-500">
         <span>INSPECTOR</span>
         <button onClick={handleClose} className="hover:text-white"><X size={12} /></button>
      </div>

      {/* Assertion Form (Mode Active) */}
      {assertionMode && (
          <div className="space-y-2 bg-primary/10 p-2 rounded border border-primary/20">
            <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                <CheckCircle size={10} /> Add Assertion
            </div>
            
            <select 
              className="w-full bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none"
              value={selectedAssertion} 
              onChange={(e) => setSelectedAssertion(e.target.value as any)}
            >
              <option value="toBeVisible">toBeVisible</option>
              <option value="toHaveText">toHaveText</option>
              <option value="toHaveValue">toHaveValue</option>
              <option value="toContainText">toContainText</option>
              <option value="toHaveAttribute">toHaveAttribute</option>
              <option value="toHaveCount">toHaveCount</option>
            </select>
            
            {selectedAssertion !== 'toBeVisible' && (
               <input
                type="text"
                value={assertionValue}
                onChange={(e) => setAssertionValue(e.target.value)}
                className="w-full bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none placeholder:text-slate-600"
                placeholder="Expected Value..."
              />
            )}

            <button 
              className="w-full py-1 bg-primary text-white text-[10px] font-bold rounded hover:bg-primary-hover"
              onClick={handleAddAssertion}
            >
              Add Step
            </button>
          </div>
      )}

      {/* Target Info */}
      <div className="space-y-1">
         <div className="flex justify-between text-[10px] text-slate-400">
            <span>TAG</span>
            <span className="text-slate-200 font-mono">{payload.tagName}</span>
         </div>
         {payload.innerText && (
            <div className="flex justify-between text-[10px] text-slate-400">
                <span>TEXT</span>
                <span className="text-slate-200 font-mono truncate max-w-[150px]" title={payload.innerText}>"{payload.innerText}"</span>
            </div>
         )}
      </div>

      {/* Locators List */}
      <div className="space-y-2">
         <div className="text-[10px] text-slate-500 font-bold">LOCATORS</div>
         <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {payload.candidates.map((candidate, idx) => (
               <div key={idx} className="group flex flex-col gap-0.5 p-1.5 rounded hover:bg-surface-lighter/30 cursor-pointer" onClick={() => setValidatorValue(candidate.value)}>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] text-slate-500 uppercase">{candidate.strategy}</span>
                     <span className="text-[9px] text-green-500/80">{(candidate.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-end gap-2">
                     <code className="text-[10px] text-slate-300 font-mono break-all leading-tight">{candidate.value}</code>
                     <button onClick={(e) => { e.stopPropagation(); handleCopy(candidate.value); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white">
                        <Copy size={10} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Validator */}
      <div className="space-y-1 pt-2 border-t border-border-dark">
         <div className="text-[10px] text-slate-500 font-bold">VALIDATOR</div>
         <div className="flex gap-1">
            <input
              type="text"
              className="flex-1 bg-background-dark text-[10px] text-slate-300 border border-border-dark rounded p-1 outline-none placeholder:text-slate-600 font-mono"
              value={validatorValue}
              onChange={(e) => setValidatorValue(e.target.value)}
              placeholder="CSS/XPath..."
              onKeyDown={(e) => e.key === 'Enter' && handleValidate(validatorValue)}
            />
            <button 
              className="px-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
              onClick={() => handleValidate(validatorValue)}
            >
              <Play size={10} />
            </button>
         </div>
         {validationResult && (
            <div className={`text-[10px] flex items-center gap-1.5 p-1 rounded ${validationResult.error ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}>
               {validationResult.error ? (
                  <>
                     <AlertCircle size={10} />
                     <span>{validationResult.error}</span>
                  </>
               ) : (
                  <>
                     <CheckCircle size={10} />
                     <span>{validationResult.count} match(es)</span>
                  </>
               )}
            </div>
         )}
      </div>
    </div>
  );
};
