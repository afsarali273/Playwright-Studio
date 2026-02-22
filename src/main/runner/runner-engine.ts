/**
 * RunnerEngine — Executes TestSteps using Playwright.
 * Supports run-all, run-from, run-single, pause, and stop.
 */

import { BrowserWindow } from 'electron';
import { chromium, Browser, Page } from 'playwright-core';
import { eventBus } from '../core/event-bus';
import { mapStepToAction } from './action-mapper';
import { IpcChannels } from '../../shared/ipc-channels';
import type {
  TestStep,
  RunnerStatus,
  RunMode,
  LogEntry,
  StepUpdatePayload,
} from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class RunnerEngine {
  private mainWindow: BrowserWindow;
  private browser: Browser | null = null;
  private page: Page | null = null;
  private status: RunnerStatus = 'idle';
  private isPaused = false;
  private isStopped = false;
  private pauseResolve: (() => void) | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  /* ---------------------------------------------------------------- */
  /*  Public API                                                       */
  /* ---------------------------------------------------------------- */

  /** Run all steps */
  async runAll(steps: TestStep[]): Promise<void> {
    await this.executeSteps(steps, 'all');
  }

  /** Run from a specific step (inclusive) */
  async runFrom(steps: TestStep[], stepId: string): Promise<void> {
    const index = steps.findIndex((s) => s.id === stepId);
    if (index === -1) {
      this.log('error', `Step ${stepId} not found`, stepId);
      return;
    }
    const subset = steps.slice(index);
    await this.executeSteps(subset, 'from');
  }

  /** Run a single step */
  async runStep(steps: TestStep[], stepId: string): Promise<void> {
    const step = steps.find((s) => s.id === stepId);
    if (!step) {
      this.log('error', `Step ${stepId} not found`, stepId);
      return;
    }
    await this.executeSteps([step], 'single');
  }

  /** Pause execution after the current step completes */
  pause(): void {
    if (this.status !== 'running') return;
    this.isPaused = true;
    this.setStatus('paused');
    this.log('info', 'Runner paused');
  }

  /** Resume execution after pause */
  resume(): void {
    if (this.status !== 'paused') return;
    this.isPaused = false;
    this.setStatus('running');
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
    this.log('info', 'Runner resumed');
  }

  /** Stop execution and clean up */
  async stop(): Promise<void> {
    this.isStopped = true;
    this.isPaused = false;
    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
    await this.cleanup();
    this.setStatus('stopped');
    this.log('info', 'Runner stopped');
  }

  /** Get current runner status */
  getStatus(): RunnerStatus {
    return this.status;
  }

  /* ---------------------------------------------------------------- */
  /*  Core execution loop                                              */
  /* ---------------------------------------------------------------- */

  private async executeSteps(steps: TestStep[], mode: RunMode): Promise<void> {
    this.isStopped = false;
    this.isPaused = false;
    this.setStatus('running');
    this.log('info', `Running ${steps.length} step(s) [mode: ${mode}]`);

    let passed = 0;
    let failed = 0;

    try {
      await this.launchBrowser();

      for (let i = 0; i < steps.length; i++) {
        if (this.isStopped) break;

        /* Handle pause */
        if (this.isPaused) {
          await new Promise<void>((resolve) => {
            this.pauseResolve = resolve;
          });
          if (this.isStopped) break;
        }

        const step = steps[i];
        const startTime = Date.now();

        /* Notify: step starting */
        this.sendStepUpdate(step.id, 'running');
        this.sendRunnerStatus('running', step.id, {
          completed: i,
          total: steps.length,
        });

        try {
          const mapped = mapStepToAction(step);
          await mapped.execute(this.page!);

          const duration = Date.now() - startTime;
          this.sendStepUpdate(step.id, 'passed');
          this.log('success', `Step passed: ${step.description ?? step.action} (${duration}ms)`, step.id);
          passed++;
        } catch (err) {
          const duration = Date.now() - startTime;
          const errorMsg = (err as Error).message;
          this.sendStepUpdate(step.id, 'failed', errorMsg);
          this.log('error', `Step failed: ${step.description ?? step.action} — ${errorMsg} (${duration}ms)`, step.id);
          failed++;

          /* Continue to next step (don't abort on failure in MVP) */
        }
      }
    } catch (err) {
      this.log('error', `Runner error: ${(err as Error).message}`);
      this.setStatus('error');
    } finally {
      if (!this.isStopped) {
        await this.cleanup();
      }

      const finalStatus: RunnerStatus = this.isStopped ? 'stopped' : 'completed';
      this.setStatus(finalStatus);

      eventBus.emit('runner:complete', {
        passed,
        failed,
        total: steps.length,
      });

      this.mainWindow.webContents.send(IpcChannels.RUNNER_COMPLETE, {
        passed,
        failed,
        total: steps.length,
      });

      this.log(
        failed > 0 ? 'warn' : 'success',
        `Run complete: ${passed} passed, ${failed} failed out of ${steps.length}`,
      );
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Browser lifecycle                                                */
  /* ---------------------------------------------------------------- */

  private async launchBrowser(): Promise<void> {
    this.log('info', 'Launching Playwright Chromium...');

    try {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'],
      });

      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      this.page = await context.newPage();
      this.log('info', 'Browser launched successfully');
    } catch (err) {
      this.log('error', `Failed to launch browser: ${(err as Error).message}`);
      throw err;
    }
  }

  private async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
    } catch {
      /* Ignore cleanup errors */
    }
  }

  /* ---------------------------------------------------------------- */
  /*  IPC Helpers                                                      */
  /* ---------------------------------------------------------------- */

  private setStatus(status: RunnerStatus): void {
    this.status = status;
    this.sendRunnerStatus(status);
  }

  private sendRunnerStatus(
    status: RunnerStatus,
    currentStepId?: string,
    progress?: { completed: number; total: number },
  ): void {
    this.mainWindow.webContents.send(IpcChannels.RUNNER_STATUS, {
      status,
      currentStepId,
      progress,
    });
    eventBus.emit('runner:status', { status, currentStepId, progress });
  }

  private sendStepUpdate(
    stepId: string,
    status: TestStep['status'],
    error?: string,
  ): void {
    const payload: StepUpdatePayload = { stepId, status, error };
    this.mainWindow.webContents.send(IpcChannels.RUNNER_STEP_UPDATE, payload);
    eventBus.emit('runner:step-update', payload);
  }

  private log(level: LogEntry['level'], message: string, stepId?: string): void {
    const entry: LogEntry = {
      id: uuidv4(),
      level,
      message,
      timestamp: Date.now(),
      source: 'runner',
    };
    if (stepId) {
      entry.stepId = stepId;
    }
    eventBus.emit('log', entry);
    this.mainWindow.webContents.send(IpcChannels.LOG_EVENT, entry);
  }
}
