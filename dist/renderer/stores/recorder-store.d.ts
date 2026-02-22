/**
 * Zustand store: Recorder
 * Tracks whether recording is active and the current URL.
 */
interface RecorderState {
    isRecording: boolean;
    isPaused: boolean;
    currentUrl: string;
    setRecording: (recording: boolean) => void;
    setPaused: (paused: boolean) => void;
    setCurrentUrl: (url: string) => void;
}
export declare const useRecorderStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RecorderState>>;
export {};
//# sourceMappingURL=recorder-store.d.ts.map