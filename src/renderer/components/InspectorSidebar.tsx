import React, { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/ui-store';
import { 
  Copy, 
  CheckCircle, 
  Target, 
  Eye, 
  Type, 
  MousePointerClick, 
  List, 
  ShieldCheck,
  Check,
  Play,
  AlertCircle
} from 'lucide-react';

export const InspectorSidebar: React.FC = () => {
  const payload = useUIStore((s) => s.inspectorPayload);
  const setAssertionMode = useUIStore((s) => s.setAssertionMode);
  
  const [copiedLocator, setCopiedLocator] = useState<string | null>(null);
  const [selectedLocator, setSelectedLocator] = useState<string>('');
  
  // Validation state
  const [validationResult, setValidationResult] = useState<{count: number, error?: string} | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (payload?.candidates && payload.candidates.length > 0) {
        // Default to the first one (Highest confidence)
        const best = payload.candidates[0];
        setSelectedLocator(best.value);
        // Auto-validate the best locator initially? Maybe too noisy.
        // Let's validate only when user selects or clicks validate.
    }
  }, [payload]);

  // Re-validate when selected locator changes
  useEffect(() => {
      if (selectedLocator) {
          handleValidate(selectedLocator);
      }
  }, [selectedLocator]);

  const handleCopy = useCallback(async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedLocator(text);
      setTimeout(() => setCopiedLocator(null), 2000);
    }
  }, []);

  const handleValidate = async (val: string) => {
    if (!window.electronAPI || !val) return;
    setIsValidating(true);
    
    // Check if it's a Playwright locator vs CSS/XPath
    if (val.includes('getBy') || val.includes('page.')) {
        // We can't validate Playwright locators easily in the browser context directly 
        // without a full runner roundtrip, unless we map them back to CSS/XPath.
        // For now, we'll show a warning or try to approximate.
        // The injected script only supports CSS/XPath validation.
        setValidationResult({ count: 0, error: 'Playwright locator validation requires running test.' });
        setIsValidating(false);
        return;
    }

    const result = await window.electronAPI.validateLocator(val);
    setValidationResult(result);
    setIsValidating(false);
  };

  const handleAddAssertion = async (type: string, value?: string) => {
    if (!window.electronAPI || !selectedLocator) return;
    
    // Switch to assertion mode if not active
    setAssertionMode(true);

    const api = window.electronAPI as any;
    if (api.addAssertion) {
        await api.addAssertion({
            selector: selectedLocator,
            assertionType: type,
            assertionValue: value || '',
            timestamp: Date.now()
        });
    }
  };

  const handleGenerateStep = async (action: 'click' | 'hover' | 'fill') => {
      // TODO: Implement manual step addition
      console.log('Generate step:', action, selectedLocator);
  };

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
        <Target size={48} className="mb-4 opacity-20" />
        <h3 className="text-sm font-bold text-slate-400 mb-2">Inspector Active</h3>
        <p className="text-xs">Hover over elements in the browser to view their properties and generate locators.</p>
      </div>
    );
  }

  // Categorize strategies
  const recommended = payload.candidates.filter(c => c.confidence >= 0.9);
  const alternate = payload.candidates.filter(c => c.confidence >= 0.6 && c.confidence < 0.9);
  const legacy = payload.candidates.filter(c => c.confidence < 0.6);

  return (
    <div className="flex flex-col h-full bg-surface-dark border-l border-border-dark w-[350px] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="p-4 border-b border-border-dark bg-surface-dark sticky top-0 z-10">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Target size={14} className="text-primary" />
          Inspector
        </h2>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Selected Locator Preview & Validation */}
        <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase">Selected Locator</h3>
            <div className="p-2 bg-black/20 rounded border border-primary/30">
                <code className="text-[11px] font-mono text-white block break-all mb-2">
                    {selectedLocator}
                </code>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button 
                            className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-white bg-white/5 px-2 py-1 rounded transition-colors"
                            onClick={() => handleCopy(selectedLocator)}
                        >
                            <Copy size={10} /> {copiedLocator === selectedLocator ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    {/* Validation Status */}
                    <div className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded ${
                        validationResult?.error ? 'text-red-400 bg-red-500/10' : 
                        validationResult?.count === 1 ? 'text-green-400 bg-green-500/10' : 
                        validationResult?.count === 0 ? 'text-yellow-400 bg-yellow-500/10' :
                        'text-blue-400 bg-blue-500/10'
                    }`}>
                        {isValidating ? (
                            <span>Checking...</span>
                        ) : validationResult?.error ? (
                            <>
                                <AlertCircle size={10} />
                                <span>Preview unavailable (Run to verify)</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={10} />
                                <span>{validationResult?.count ?? 0} Match(es)</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>

        {/* Locator Strategies List */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase">Available Strategies</h3>
          </div>

          <div className="space-y-3">
            {/* Recommended */}
            {recommended.length > 0 && (
                <div className="space-y-1">
                    <div className="text-[10px] font-bold text-green-400 flex items-center gap-1 mb-1">
                        <ShieldCheck size={10} /> RECOMMENDED
                    </div>
                    {recommended.map((c, i) => (
                        <div 
                            key={i} 
                            className={`p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`}
                            onClick={() => setSelectedLocator(c.value)}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold">{c.strategy}</span>
                                <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 rounded font-mono">{(c.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <code className="text-[10px] font-mono text-slate-300 block break-all leading-relaxed">{c.value}</code>
                        </div>
                    ))}
                </div>
            )}

            {/* Alternate */}
            {alternate.length > 0 && (
                <div className="space-y-1">
                    <div className="text-[10px] font-bold text-yellow-400 mb-1">ALTERNATE</div>
                    {alternate.map((c, i) => (
                        <div 
                            key={i} 
                            className={`p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`}
                            onClick={() => setSelectedLocator(c.value)}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold">{c.strategy}</span>
                                <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 rounded font-mono">{(c.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <code className="text-[10px] font-mono text-slate-300 block break-all leading-relaxed">{c.value}</code>
                        </div>
                    ))}
                </div>
            )}

            {/* Legacy */}
            {legacy.length > 0 && (
                <div className="space-y-1">
                    <div className="text-[10px] font-bold text-red-400 mb-1">LEGACY</div>
                    {legacy.map((c, i) => (
                        <div 
                            key={i} 
                            className={`p-2 rounded border cursor-pointer transition-all ${selectedLocator === c.value ? 'bg-primary/10 border-primary/50' : 'bg-surface-lighter/30 border-transparent hover:border-primary/30'}`}
                            onClick={() => setSelectedLocator(c.value)}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[9px] text-slate-500 uppercase font-bold">{c.strategy}</span>
                                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 rounded font-mono">{(c.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <code className="text-[10px] font-mono text-slate-400 block break-all leading-relaxed">{c.value}</code>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </section>

        {/* Element Properties */}
        <section>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Element Properties</h3>
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-surface-lighter/20 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">TAG</div>
                    <div className="text-[11px] text-primary font-mono">&lt;{payload.tagName}&gt;</div>
                </div>
                <div className="p-2 bg-surface-lighter/20 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">VISIBLE</div>
                    <div className={`text-[11px] font-bold ${payload.isVisible ? 'text-green-400' : 'text-red-400'}`}>
                        {String(payload.isVisible)}
                    </div>
                </div>
                <div className="p-2 bg-surface-lighter/20 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">DIMENSIONS</div>
                    <div className="text-[11px] text-slate-300">
                        {payload.rect ? `${Math.round(payload.rect.width)} x ${Math.round(payload.rect.height)} px` : '-'}
                    </div>
                </div>
                <div className="p-2 bg-surface-lighter/20 rounded">
                    <div className="text-[9px] text-slate-500 uppercase">ARIA-ROLE</div>
                    <div className="text-[11px] text-slate-300">{payload.attributes?.role || '-'}</div>
                </div>
            </div>
        </section>

        {/* Quick Assertions */}
        <section>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Quick Assertions</h3>
            <div className="space-y-2">
                <button 
                    className="w-full flex items-center justify-between p-2 rounded bg-surface-lighter/30 hover:bg-surface-lighter/50 transition-colors group"
                    onClick={() => handleAddAssertion('toBeVisible')}
                >
                    <div className="flex items-center gap-2">
                        <Eye size={12} className="text-slate-400 group-hover:text-white" />
                        <span className="text-[11px] text-slate-300 group-hover:text-white">Assert Visible</span>
                    </div>
                    <CheckCircle size={12} className="text-slate-500 opacity-0 group-hover:opacity-100" />
                </button>

                {payload.innerText && (
                    <button 
                        className="w-full flex items-center justify-between p-2 rounded bg-surface-lighter/30 hover:bg-surface-lighter/50 transition-colors group"
                        onClick={() => handleAddAssertion('toHaveText', payload.innerText)}
                    >
                        <div className="flex items-center gap-2">
                            <Type size={12} className="text-slate-400 group-hover:text-white" />
                            <span className="text-[11px] text-slate-300 group-hover:text-white truncate max-w-[180px]">Assert Text "{payload.innerText.slice(0, 20)}..."</span>
                        </div>
                        <CheckCircle size={12} className="text-slate-500 opacity-0 group-hover:opacity-100" />
                    </button>
                )}
            </div>
        </section>

        {/* Generate Button */}
        <button 
            className="w-full py-2 bg-primary text-white text-xs font-bold rounded shadow-lg shadow-primary/20 hover:bg-primary-hover active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            onClick={() => handleGenerateStep('click')} // Default to click for now
        >
            <Play size={14} />
            Generate Test Step
        </button>

      </div>
    </div>
  );
};
