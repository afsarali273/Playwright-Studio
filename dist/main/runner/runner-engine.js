"use strict";
/**
 * RunnerEngine — Executes TestSteps using Playwright.
 * Supports run-all, run-from, run-single, pause, and stop.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerEngine = void 0;
const playwright_core_1 = require("playwright-core");
const event_bus_1 = require("../core/event-bus");
const action_mapper_1 = require("./action-mapper");
const ipc_channels_1 = require("../../shared/ipc-channels");
const uuid_1 = require("uuid");
class RunnerEngine {
    mainWindow;
    browser = null;
    page = null;
    status = 'idle';
    isPaused = false;
    isStopped = false;
    pauseResolve = null;
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    }
    /* ---------------------------------------------------------------- */
    /*  Public API                                                       */
    /* ---------------------------------------------------------------- */
    /** Run all steps */
    async runAll(steps) {
        await this.executeSteps(steps, 'all');
    }
    /** Run from a specific step (inclusive) */
    async runFrom(steps, stepId) {
        const index = steps.findIndex((s) => s.id === stepId);
        if (index === -1) {
            this.log('error', `Step ${stepId} not found`, stepId);
            return;
        }
        const subset = steps.slice(index);
        await this.executeSteps(subset, 'from');
    }
    /** Run a single step */
    async runStep(steps, stepId) {
        const step = steps.find((s) => s.id === stepId);
        if (!step) {
            this.log('error', `Step ${stepId} not found`, stepId);
            return;
        }
        await this.executeSteps([step], 'single');
    }
    /** Pause execution after the current step completes */
    pause() {
        if (this.status !== 'running')
            return;
        this.isPaused = true;
        this.setStatus('paused');
        this.log('info', 'Runner paused');
    }
    /** Resume execution after pause */
    resume() {
        if (this.status !== 'paused')
            return;
        this.isPaused = false;
        this.setStatus('running');
        if (this.pauseResolve) {
            this.pauseResolve();
            this.pauseResolve = null;
        }
        this.log('info', 'Runner resumed');
    }
    /** Stop execution and clean up */
    async stop() {
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
    getStatus() {
        return this.status;
    }
    /* ---------------------------------------------------------------- */
    /*  Core execution loop                                              */
    /* ---------------------------------------------------------------- */
    async executeSteps(steps, mode) {
        this.isStopped = false;
        this.isPaused = false;
        this.setStatus('running');
        this.log('info', `Running ${steps.length} step(s) [mode: ${mode}]`);
        let passed = 0;
        let failed = 0;
        try {
            await this.launchBrowser();
            for (let i = 0; i < steps.length; i++) {
                if (this.isStopped)
                    break;
                /* Handle pause */
                if (this.isPaused) {
                    await new Promise((resolve) => {
                        this.pauseResolve = resolve;
                    });
                    if (this.isStopped)
                        break;
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
                    const mapped = (0, action_mapper_1.mapStepToAction)(step);
                    await mapped.execute(this.page);
                    const duration = Date.now() - startTime;
                    this.sendStepUpdate(step.id, 'passed');
                    this.log('success', `Step passed: ${step.description ?? step.action} (${duration}ms)`, step.id);
                    passed++;
                }
                catch (err) {
                    const duration = Date.now() - startTime;
                    const errorMsg = err.message;
                    this.sendStepUpdate(step.id, 'failed', errorMsg);
                    this.log('error', `Step failed: ${step.description ?? step.action} — ${errorMsg} (${duration}ms)`, step.id);
                    failed++;
                    /* Continue to next step (don't abort on failure in MVP) */
                }
            }
        }
        catch (err) {
            this.log('error', `Runner error: ${err.message}`);
            this.setStatus('error');
        }
        finally {
            if (!this.isStopped) {
                await this.cleanup();
            }
            const finalStatus = this.isStopped ? 'stopped' : 'completed';
            this.setStatus(finalStatus);
            event_bus_1.eventBus.emit('runner:complete', {
                passed,
                failed,
                total: steps.length,
            });
            this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RUNNER_COMPLETE, {
                passed,
                failed,
                total: steps.length,
            });
            this.log(failed > 0 ? 'warn' : 'success', `Run complete: ${passed} passed, ${failed} failed out of ${steps.length}`);
        }
    }
    /* ---------------------------------------------------------------- */
    /*  Browser lifecycle                                                */
    /* ---------------------------------------------------------------- */
    async launchBrowser() {
        this.log('info', 'Launching Playwright Chromium...');
        try {
            this.browser = await playwright_core_1.chromium.launch({
                headless: false,
                args: ['--disable-blink-features=AutomationControlled'],
            });
            const context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
            });
            this.page = await context.newPage();
            this.log('info', 'Browser launched successfully');
        }
        catch (err) {
            this.log('error', `Failed to launch browser: ${err.message}`);
            throw err;
        }
    }
    async cleanup() {
        try {
            if (this.page) {
                await this.page.close().catch(() => { });
                this.page = null;
            }
            if (this.browser) {
                await this.browser.close().catch(() => { });
                this.browser = null;
            }
        }
        catch {
            /* Ignore cleanup errors */
        }
    }
    /* ---------------------------------------------------------------- */
    /*  IPC Helpers                                                      */
    /* ---------------------------------------------------------------- */
    setStatus(status) {
        this.status = status;
        this.sendRunnerStatus(status);
    }
    sendRunnerStatus(status, currentStepId, progress) {
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RUNNER_STATUS, {
            status,
            currentStepId,
            progress,
        });
        event_bus_1.eventBus.emit('runner:status', { status, currentStepId, progress });
    }
    sendStepUpdate(stepId, status, error) {
        const payload = { stepId, status, error };
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RUNNER_STEP_UPDATE, payload);
        event_bus_1.eventBus.emit('runner:step-update', payload);
    }
    log(level, message, stepId) {
        const entry = {
            id: (0, uuid_1.v4)(),
            level,
            message,
            timestamp: Date.now(),
            source: 'runner',
        };
        if (stepId) {
            entry.stepId = stepId;
        }
        event_bus_1.eventBus.emit('log', entry);
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.LOG_EVENT, entry);
    }
}
exports.RunnerEngine = RunnerEngine;
//# sourceMappingURL=runner-engine.js.map