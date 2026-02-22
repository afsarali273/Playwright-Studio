/**
 * RecorderEngine - Orchestrates the recording workflow.
 * Creates the browser view, injects recorder script, processes events,
 * and converts raw DOM events into structured TestSteps.
 */
import { BrowserWindow } from 'electron';
import { BrowserManager } from '../core/browser-manager';
import type { TestStep } from '../../shared/types';
export declare class RecorderEngine {
    private browserManager;
    private mainWindow;
    private isRecording;
    private isPaused;
    private steps;
    private onDidFinishLoad;
    private onDomReady;
    constructor(mainWindow: BrowserWindow, browserManager: BrowserManager);
    /** Start recording on a given URL */
    start(url?: string): Promise<void>;
    /** Stop recording */
    stop(): void;
    pause(): void;
    resume(): void;
    private cleanupListeners;
    getIsRecording(): boolean;
    getSteps(): TestStep[];
    setSteps(steps: TestStep[]): void;
    clearSteps(): void;
    addStep(step: TestStep): void;
    addAssertionStep(payload: {
        selector: string;
        assertionType: string;
        assertionValue?: string;
        timestamp: number;
    }): void;
    updateStep(updatedStep: TestStep): void;
    deleteStep(stepId: string): void;
    reorderSteps(stepIds: string[]): void;
    private injectRecorder;
    private processRecorderEvent;
    private createStepFromEvent;
    private buildSelectorCandidates;
    private createStep;
    private describeStep;
    private log;
    private setupIpcListeners;
}
//# sourceMappingURL=recorder-engine.d.ts.map