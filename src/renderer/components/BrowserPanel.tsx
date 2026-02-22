/**
 * BrowserPanel component
 * Center panel that hosts the embedded browser viewport.
 * In Electron, the actual browser is a BrowserView overlaid on this region.
 * This component reports its bounding rect so the main process can position it.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useRecorderStore } from '../stores/recorder-store';
import { useUIStore } from '../stores/ui-store';

export const BrowserPanel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isRecording = useRecorderStore((s) => s.isRecording);
  const browserUrl = useUIStore((s) => s.browserUrl);
  
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    setUrlInput(browserUrl);
  }, [browserUrl]);

  const handleNavigate = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && urlInput.trim()) {
        if (!window.electronAPI) return;
        let url = urlInput.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        await window.electronAPI.navigateTo(url);
        setUrlInput(url);
      }
    },
    [urlInput]
  );

  const handleReload = useCallback(async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.reloadBrowser();
  }, []);

  /**
   * Report the bounding rect of this container to the main process
   * so it can position the BrowserView exactly on top.
   */
  const reportBounds = useCallback(() => {
    if (!containerRef.current || !window.electronAPI) return;
    const rect = containerRef.current.getBoundingClientRect();
    window.electronAPI.setBrowserBounds({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
  }, []);

  useEffect(() => {
    // Delay reporting to ensure layout is stable
    const timer = setTimeout(reportBounds, 100);
    
    const resizeObserver = new ResizeObserver(() => {
      reportBounds();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', reportBounds);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', reportBounds);
    };
  }, [reportBounds]);

  return (
    <div className="flex flex-col flex-1 h-full min-w-0">
      {/* Browser Header */}
      <div className="h-14 flex items-center gap-4 px-4 border-b border-border-dark bg-surface-dark flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1 bg-red-500 text-white rounded-t-md ml-4 mr-auto text-[10px] font-bold uppercase tracking-tighter">
          {isRecording ? 'REC' : 'IDLE'} <span className="text-white/80 font-normal ml-2">Browser</span>
        </div>
        
        <div className="flex-1 mx-4 bg-background-dark rounded-full flex items-center px-4 py-1.5 border border-border-dark">
          <input 
            className="flex-1 text-xs text-slate-300 font-mono bg-transparent border-none focus:ring-0 p-0 outline-none"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={handleNavigate}
            placeholder="Enter URL..."
          />
          <div className="flex items-center gap-3 text-slate-500">
            {urlInput && (
                <button onClick={() => setUrlInput('')} className="hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
            )}
            <button onClick={handleReload} className="hover:text-white" title="Reload"><span className="material-symbols-outlined text-sm">refresh</span></button>
            <span className="material-symbols-outlined text-sm">search</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 pr-4 text-slate-400">
          <span className="material-symbols-outlined text-lg">settings</span>
          <span className="material-symbols-outlined text-lg">apps</span>
          <button className="px-4 py-1 bg-slate-100 text-slate-900 rounded-full text-xs font-bold">Sign in</button>
        </div>
      </div>

      {/* Browser Viewport */}
      <div
        ref={containerRef}
        className="flex-1 relative bg-[#1e2029] overflow-hidden"
        data-testid="browser-viewport"
      >
        {!window.electronAPI && (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Embedded browser viewport</p>
          </div>
        )}
      </div>
    </div>
  );
};
