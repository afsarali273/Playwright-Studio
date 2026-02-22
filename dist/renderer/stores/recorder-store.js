"use strict";
/**
 * Zustand store: Recorder
 * Tracks whether recording is active and the current URL.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRecorderStore = void 0;
const zustand_1 = require("zustand");
exports.useRecorderStore = (0, zustand_1.create)((set) => ({
    isRecording: false,
    isPaused: false,
    currentUrl: '',
    setRecording: (recording) => set({ isRecording: recording }),
    setPaused: (paused) => set({ isPaused: paused }),
    setCurrentUrl: (url) => set({ currentUrl: url }),
}));
//# sourceMappingURL=recorder-store.js.map