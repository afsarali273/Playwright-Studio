/**
 * ExportModal component
 * Shows generated Playwright code with syntax highlighting via a
 * simple monospace pre block (Monaco is available for advanced editing).
 */

import React, { useCallback, useState, useEffect } from 'react';
import { useUIStore, type ScriptLanguage } from '../stores/ui-store';
import { X, Copy, Download, Check, FileText } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const ExportModal: React.FC = () => {
  const isOpen = useUIStore((s) => s.exportModalOpen);
  const code = useUIStore((s) => s.exportedCode);
  const setOpen = useUIStore((s) => s.setExportModalOpen);
  const exportLanguage = useUIStore((s) => s.exportLanguage);
  const setExportLanguage = useUIStore((s) => s.setExportLanguage);
  const setExportedCode = useUIStore((s) => s.setExportedCode);
  
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;
    
    if (isOpen) {
      // Hide the browser view so the modal appears on top
      window.electronAPI.hideBrowserView();
    } else {
      // Show it again when closed
      window.electronAPI.showBrowserView();
    }
    
    return () => {
      if (isOpen && window.electronAPI) {
        window.electronAPI.showBrowserView();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = useCallback(async (lang: ScriptLanguage) => {
    setExportLanguage(lang);
    if (window.electronAPI) {
      const code = await window.electronAPI.exportScript(lang);
      setExportedCode(code);
    }
  }, [setExportLanguage, setExportedCode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy');
    }
  }, [code]);

  const handleDownload = useCallback(() => {
    let ext = 'ts';
    if (exportLanguage === 'java') {
      ext = 'java';
    } else if (exportLanguage === 'cucumber') {
      ext = 'feature';
    }
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-test.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, exportLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[800px] h-[600px] bg-surface-dark border border-border-dark rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dark bg-surface-lighter/10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <FileText size={20} className="text-primary" />
             </div>
             <div>
                <h3 className="text-sm font-bold text-white">Export Test Script</h3>
                <p className="text-[11px] text-slate-400">
                  Generated {exportLanguage === 'cucumber' ? 'Cucumber Gherkin feature file' : exportLanguage === 'java' ? 'Playwright Java code' : 'Playwright TypeScript code'}
                </p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
                <select 
                    className="bg-surface-lighter text-xs text-slate-300 border border-border-dark rounded px-2 py-1 outline-none focus:border-primary cursor-pointer"
                    value={exportLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value as ScriptLanguage)}
                >
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="cucumber">Cucumber</option>
                </select>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  copied 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-surface-lighter hover:bg-surface-lighter/80 text-slate-300 border border-border-dark'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Download size={14} />
              Download .{exportLanguage === 'cucumber' ? 'feature' : exportLanguage === 'java' ? 'java' : 'ts'}
            </button>

            <div className="w-[1px] h-6 bg-border-dark mx-2"></div>

            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-hidden relative group">
           <div className="absolute inset-0 overflow-auto custom-scrollbar bg-[#1e1e1e]">
              <SyntaxHighlighter
                language={exportLanguage === 'cucumber' ? 'gherkin' : exportLanguage}
                style={vscDarkPlus}
                customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    background: 'transparent',
                    fontFamily: '"JetBrains Mono", monospace'
                }}
                showLineNumbers={true}
                lineNumberStyle={{
                    minWidth: '3em',
                    paddingRight: '1em',
                    color: '#6e7681',
                    textAlign: 'right'
                }}
              >
                {code}
              </SyntaxHighlighter>
           </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-dark bg-surface-lighter/5 flex justify-between items-center text-[10px] text-slate-500">
           <span>Playwright v1.42.0 Compatible</span>
           <div className="flex gap-4">
              <span>{exportLanguage === 'cucumber' ? 'Gherkin' : exportLanguage === 'java' ? 'Java' : 'TypeScript'}</span>
              <span>UTF-8</span>
           </div>
        </div>

      </div>
    </div>
  );
};
