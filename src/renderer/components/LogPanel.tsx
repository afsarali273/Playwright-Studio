/**
 * LogPanel component
 * Right panel showing real-time logs, errors, and debug information.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useLogsStore } from '../stores/logs-store';
import { useUIStore } from '../stores/ui-store';
import { useStepsStore } from '../stores/steps-store';
import { 
  Terminal, 
  Undo, 
  Redo, 
  ChevronRight, 
  Pause, 
  Square, 
  Copy, 
  Check 
} from 'lucide-react';

export const LogPanel: React.FC = () => {
  const logs = useLogsStore((s) => s.logs);
  const logsCollapsed = useUIStore((s) => s.logsCollapsed);
  const toggleLogsCollapsed = useUIStore((s) => s.toggleLogsCollapsed);
  const steps = useStepsStore((s) => s.steps);
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate code when steps change
  useEffect(() => {
    let mounted = true;
    const updateCode = async () => {
        if (!window.electronAPI) return;
        try {
            const code = await window.electronAPI.exportScript();
            if (mounted) setGeneratedCode(code);
        } catch (e) {
            console.error(e);
        }
    };
    updateCode();
    // Debounce or just run on steps change
    const timeout = setTimeout(updateCode, 500);
    return () => { mounted = false; clearTimeout(timeout); };
  }, [steps]);

  const handleCopy = useCallback(async () => {
    if (generatedCode) {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedCode]);

  if (logsCollapsed) return null;

  return (
    <aside 
      className="w-[480px] bg-surface-dark border-l border-border-dark flex flex-col flex-shrink-0 z-20 shadow-xl right-panel-transition" 
      id="right-sidebar"
    >
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 border-b border-border-dark relative">
           <button 
             className="absolute -left-3 top-20 bg-surface-dark border border-border-dark text-slate-400 hover:text-white rounded-full p-1 shadow-lg z-50 lg:hidden" 
             onClick={toggleLogsCollapsed}
           > 
             <ChevronRight size={12} /> 
           </button>
           
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
               <Terminal size={14} className="text-primary" />
               Generated Code
             </h2>
             <div className="flex items-center gap-2">
               <button className="text-slate-500 hover:text-white"><Undo size={14} /></button>
               <button className="text-slate-500 hover:text-white"><Redo size={14} /></button>
             </div>
           </div>
           
           <div className="flex items-center gap-4 mb-4">
             <div className="relative flex-1">
               <select className="w-full bg-surface-lighter text-[10px] text-slate-300 border border-border-dark rounded p-1 appearance-none outline-none">
                 <option>TypeScript (Playwright)</option>
                 <option disabled>Python (Coming Soon)</option>
               </select>
             </div>
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-slate-400">Cucumber BDD</span>
               <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-not-allowed">
                 <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-500 rounded-full"></div>
               </div>
             </div>
           </div>
           
           <div className="flex gap-2">
             <button className="flex-1 py-1.5 rounded bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors">
               <Square size={14} /> Stop
             </button>
             <button className="flex-1 py-1.5 rounded bg-surface-lighter border border-border-dark text-slate-300 text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-surface-lighter/80 transition-colors">
               <Pause size={14} /> Pause
             </button>
           </div>
        </div>

        {/* Recorded Actions Log (Middle) */}
        <div className="p-4 border-b border-border-dark overflow-y-auto max-h-64 flex-shrink-0">
           <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Recorded Actions</div>
           <div className="space-y-4 font-mono text-[10px]">
              {logs.filter(l => l.source === 'recorder').slice(-10).map((log, i) => (
                  <div key={log.id} className="flex gap-3 text-slate-500">
                      <span className="w-1 h-1 bg-slate-600 rounded-full mt-1.5"></span>
                      <div>
                          <div>Action <span className="ml-2 text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span></div>
                          <div className="text-slate-400">{log.message}</div>
                      </div>
                  </div>
              ))}
              {logs.length === 0 && <div className="text-slate-600 italic">No actions recorded yet.</div>}
           </div>
        </div>

        {/* Code View (Bottom) */}
        <div className="flex-1 bg-[#1e2029] flex flex-col min-h-0">
           <div className="p-3 border-b border-border-dark flex justify-between items-center bg-surface-dark/50">
              <span className="text-[10px] text-slate-500 font-mono">tests/test.spec.ts</span>
              <button 
                className="text-[10px] text-primary flex items-center gap-1 hover:text-white transition-colors"
                onClick={handleCopy}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
           </div>
           <div className="flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-auto whitespace-pre">
              {generatedCode || '// No code generated yet'}
           </div>
        </div>
      </div>
    </aside>
  );
};
