/**
 * Preload script for the embedded BrowserView.
 * Bridges recorder events from the injected page script to the main process.
 */

import { contextBridge, ipcRenderer } from 'electron';
import { IpcChannels } from '../shared/ipc-channels';

contextBridge.exposeInMainWorld('__recorder', {
  sendEvent: (event: unknown): void => {
    ipcRenderer.send(IpcChannels.RECORDER_EVENT_FROM_PAGE, event);
  },
});

contextBridge.exposeInMainWorld('__inspector', {
  sendEvent: (event: unknown): void => {
    ipcRenderer.send(IpcChannels.INSPECTOR_EVENT_FROM_PAGE, event);
  },
});
