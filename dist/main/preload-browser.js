"use strict";
/**
 * Preload script for the embedded BrowserView.
 * Bridges recorder events from the injected page script to the main process.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const ipc_channels_1 = require("../shared/ipc-channels");
electron_1.contextBridge.exposeInMainWorld('__recorder', {
    sendEvent: (event) => {
        electron_1.ipcRenderer.send(ipc_channels_1.IpcChannels.RECORDER_EVENT_FROM_PAGE, event);
    },
});
electron_1.contextBridge.exposeInMainWorld('__inspector', {
    sendEvent: (event) => {
        electron_1.ipcRenderer.send(ipc_channels_1.IpcChannels.INSPECTOR_EVENT_FROM_PAGE, event);
    },
});
//# sourceMappingURL=preload-browser.js.map