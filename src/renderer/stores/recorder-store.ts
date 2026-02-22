/**
 * Zustand store: Recorder
 * Tracks whether recording is active and the current URL.
 */

import { create } from 'zustand';

interface RecorderState {
  isRecording: boolean;
  isPaused: boolean;
  currentUrl: string;
  setRecording: (recording: boolean) => void;
  setPaused: (paused: boolean) => void;
  setCurrentUrl: (url: string) => void;
}

export const useRecorderStore = create<RecorderState>((set) => ({
  isRecording: false,
  isPaused: false,
  currentUrl: '',

  setRecording: (recording) => set({ isRecording: recording }),
  setPaused: (paused) => set({ isPaused: paused }),
  setCurrentUrl: (url) => set({ currentUrl: url }),
}));
