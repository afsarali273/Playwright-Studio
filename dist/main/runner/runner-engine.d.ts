/**
 * RunnerEngine — Executes TestSteps using Playwright.
 * Supports run-all, run-from, run-single, pause, and stop.
 */
import { BrowserWindow } from 'electron';
import type { TestStep, RunnerStatus } from '../../shared/types';
export declare class RunnerEngine {
    private mainWindow;
    private browser;
    private page;
    private status;
    private isPaused;
    private isStopped;
    private pauseResolve;
    constructor(mainWindow: BrowserWindow);
    /** Run all steps */
    runAll(steps: TestStep[]): Promise<void>;
    /** Run from a specific step (inclusive) */
    runFrom(steps: TestStep[], stepId: string): Promise<void>;
    /** Run a single step */
    runStep(steps: TestStep[], stepId: string): Promise<void>;
    /** Pause execution after the current step completes */
    pause(): void;
    /** Resume execution after pause */
    resume(): void;
    /** Stop execution and clean up */
    stop(): Promise<void>;
    /** Get current runner status */
    getStatus(): RunnerStatus;
    private executeSteps;
    private launchBrowser;
    private cleanup;
    private setStatus;
    private sendRunnerStatus;
    private sendStepUpdate;
    private log;
}
//# sourceMappingURL=runner-engine.d.ts.map