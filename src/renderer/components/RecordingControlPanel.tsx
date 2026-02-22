import React from 'react';
import { useRecorderStore } from '../stores/recorder-store';
import { useUIStore } from '../stores/ui-store';
import { Eye, Type, MousePointer2, CheckCircle, X, CheckSquare, List, Link, Code } from 'lucide-react';
import { getApplicableAssertions } from '../utils/assertion-utils';

export const RecordingControlPanel: React.FC = () => {
  const isRecording = useRecorderStore((s) => s.isRecording);
  const assertionMode = useUIStore((s) => s.assertionMode);
  const payload = useUIStore((s) => s.inspectorPayload);
  
  if (!isRecording) return null;

  const handleToggleAssertionMode = async () => {
    if (!window.electronAPI) return;
    
    if (assertionMode) {
      // Exit assertion mode
      await window.electronAPI.inspectStop();
      useUIStore.getState().setAssertionMode(false);
      useUIStore.getState().setInspectorPayload(null);
    } else {
      // Enter assertion mode
      await window.electronAPI.inspectStart();
      useUIStore.getState().setAssertionMode(true);
    }
  };

  const handleAddAssertion = async (type: string, value?: string) => {
    if (!window.electronAPI || !payload) return;
    
    const locator = payload.candidates?.[0]?.value; // Use best candidate
    if (!locator) return;

    await window.electronAPI.addAssertion({
        selector: locator,
        assertionType: type,
        assertionValue: value || '',
        timestamp: Date.now()
    });

    // Automatically exit assertion mode after adding one
    handleToggleAssertionMode();
  };

  const assertionOptions = getApplicableAssertions(payload);

  const getIcon = (category: string, type: string) => {
      if (type.includes('Visible') || type.includes('Hidden')) return <Eye size={14} />;
      if (type.includes('Text')) return <Type size={14} />;
      if (type.includes('Count')) return <List size={14} />;
      if (type.includes('Checked')) return <CheckSquare size={14} />;
      if (type.includes('Attribute') || type.includes('Href')) return <Link size={14} />;
      return <Code size={14} />;
  };

  return (
    <div className="border-t border-border-dark bg-surface-dark p-3 flex flex-col gap-3 animate-in slide-in-from-bottom-2 duration-200">
       {/* Header / Status */}
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="relative flex items-center justify-center w-2.5 h-2.5">
                <div className="absolute w-full h-full rounded-full bg-red-500 animate-ping opacity-75"></div>
                <div className="relative w-1.5 h-1.5 rounded-full bg-red-500"></div>
             </div>
             <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Recording</span>
          </div>
          
          <button 
             className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                assertionMode 
                 ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                 : 'bg-primary text-white hover:bg-primary-hover'
             }`}
             onClick={handleToggleAssertionMode}
          >
             {assertionMode ? (
                 <>
                    <X size={12} /> Cancel
                 </>
             ) : (
                 <>
                    <CheckCircle size={12} /> Add Assertion
                 </>
             )}
          </button>
       </div>

       {/* Assertion Mode Content */}
       {assertionMode && (
           <div className="space-y-2 pt-2 border-t border-white/5">
               {!payload ? (
                   <div className="text-xs text-slate-500 text-center py-3 flex flex-col items-center justify-center gap-2 bg-black/20 rounded border border-white/5 border-dashed">
                       <MousePointer2 size={16} className="animate-bounce text-primary" />
                       <span>Hover over an element...</span>
                   </div>
               ) : (
                   <div className="space-y-2">
                       {/* Target Display */}
                       <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded border border-white/5">
                           <span className="text-[9px] uppercase font-bold text-slate-600">Target</span>
                           <code className="text-[10px] text-green-300 font-mono truncate flex-1">
                               {payload.candidates?.[0]?.value || payload.tagName}
                           </code>
                       </div>
                       
                       {/* Assertion List */}
                       <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                           {assertionOptions.map((opt) => (
                               <button 
                                   key={opt.type + opt.label}
                                   className="group flex items-center gap-2 p-2 rounded bg-surface-lighter/30 hover:bg-primary/20 border border-transparent hover:border-primary/30 transition-all text-left"
                                   onClick={() => handleAddAssertion(opt.type, opt.defaultValue)}
                               >
                                   <div className="p-1 rounded bg-surface-dark group-hover:bg-primary/20 text-slate-400 group-hover:text-primary transition-colors">
                                       {getIcon(opt.category, opt.type)}
                                   </div>
                                   <div className="flex flex-col min-w-0">
                                       <span className="text-[11px] text-white font-bold group-hover:text-primary-light">{opt.label}</span>
                                       {opt.defaultValue && (
                                           <span className="text-[9px] text-slate-500 truncate">
                                               "{opt.defaultValue.slice(0, 25)}{opt.defaultValue.length > 25 ? '...' : ''}"
                                           </span>
                                       )}
                                   </div>
                               </button>
                           ))}
                           {assertionOptions.length === 0 && (
                               <div className="text-center text-slate-500 text-[10px] py-2">
                                   No suggestions available
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
       )}
    </div>
  );
};
