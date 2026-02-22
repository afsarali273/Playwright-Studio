"use strict";
/**
 * RecorderEngine - Orchestrates the recording workflow.
 * Creates the browser view, injects recorder script, processes events,
 * and converts raw DOM events into structured TestSteps.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorderEngine = void 0;
const electron_1 = require("electron");
const event_bus_1 = require("../core/event-bus");
const inject_script_1 = require("./inject-script");
const ipc_channels_1 = require("../../shared/ipc-channels");
const uuid_1 = require("uuid");
class RecorderEngine {
    browserManager;
    mainWindow;
    isRecording = false;
    isPaused = false;
    steps = [];
    onDidFinishLoad = null;
    onDomReady = null;
    constructor(mainWindow, browserManager) {
        this.mainWindow = mainWindow;
        this.browserManager = browserManager;
        this.setupIpcListeners();
    }
    /** Start recording on a given URL */
    async start(url) {
        if (this.isRecording) {
            this.log('warn', 'Already recording. Stop first.');
            return;
        }
        this.isRecording = true;
        this.isPaused = false;
        // Use existing view if available, or create with default bounds
        if (!this.browserManager.getView()) {
            const defaultBounds = { x: 300, y: 50, width: 800, height: 650 };
            this.browserManager.create(defaultBounds);
        }
        // Determine target URL
        const currentUrl = this.browserManager.getCurrentUrl();
        let targetUrl = url;
        if (!targetUrl) {
            if (currentUrl && currentUrl !== 'about:blank') {
                targetUrl = currentUrl;
            }
            else {
                targetUrl = 'https://google.com';
            }
        }
        // Only navigate if the URL is different or if it's the initial empty state
        if (!currentUrl || currentUrl === 'about:blank' || (url && currentUrl !== url)) {
            await this.browserManager.navigate(targetUrl);
        }
        else {
            console.log('[RecorderEngine] Already on URL, injecting script directly');
        }
        const navStep = this.createStep('navigate', '', targetUrl);
        this.addStep(navStep);
        await this.injectRecorder();
        const wc = this.browserManager.getWebContents();
        if (wc) {
            this.cleanupListeners(); // Remove any old listeners if they exist
            this.onDidFinishLoad = async () => {
                if (this.isRecording && !this.isPaused) {
                    console.log('[RecorderEngine] did-finish-load, injecting script');
                    await this.injectRecorder();
                    const currentUrl = wc.getURL();
                    const step = this.createStep('navigate', '', currentUrl);
                    this.addStep(step);
                }
            };
            this.onDomReady = async () => {
                if (this.isRecording && !this.isPaused) {
                    console.log('[RecorderEngine] dom-ready, injecting script');
                    await this.injectRecorder();
                }
            };
            wc.on('did-finish-load', this.onDidFinishLoad);
            wc.on('dom-ready', this.onDomReady);
        }
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RECORDER_STATUS, {
            recording: true,
            paused: false,
            url: targetUrl,
        });
        event_bus_1.eventBus.emit('recorder:started', { url: targetUrl });
        this.log('info', 'Recording started on ' + targetUrl);
    }
    /** Stop recording */
    stop() {
        if (!this.isRecording)
            return;
        this.isRecording = false;
        this.isPaused = false;
        this.cleanupListeners();
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RECORDER_STATUS, {
            recording: false,
            paused: false,
        });
        event_bus_1.eventBus.emit('recorder:stopped', undefined);
        this.log('info', 'Recording stopped');
    }
    pause() {
        if (!this.isRecording || this.isPaused)
            return;
        this.isPaused = true;
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RECORDER_STATUS, {
            recording: true,
            paused: true,
        });
        event_bus_1.eventBus.emit('recorder:paused', undefined);
        this.log('info', 'Recording paused');
    }
    resume() {
        if (!this.isRecording || !this.isPaused)
            return;
        this.isPaused = false;
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.RECORDER_STATUS, {
            recording: true,
            paused: false,
        });
        event_bus_1.eventBus.emit('recorder:resumed', undefined);
        this.log('info', 'Recording resumed');
    }
    cleanupListeners() {
        const wc = this.browserManager.getWebContents();
        if (wc) {
            if (this.onDidFinishLoad) {
                wc.removeListener('did-finish-load', this.onDidFinishLoad);
                this.onDidFinishLoad = null;
            }
            if (this.onDomReady) {
                wc.removeListener('dom-ready', this.onDomReady);
                this.onDomReady = null;
            }
        }
    }
    getIsRecording() {
        return this.isRecording;
    }
    getSteps() {
        return [...this.steps];
    }
    setSteps(steps) {
        this.steps = [...steps];
    }
    clearSteps() {
        this.steps = [];
    }
    addStep(step) {
        this.steps.push(step);
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.STEP_ADDED, step);
        event_bus_1.eventBus.emit('step:added', step);
    }
    addAssertionStep(payload) {
        const step = {
            id: (0, uuid_1.v4)(),
            action: 'assert',
            selector: payload.selector,
            value: payload.assertionValue, // store value if needed for comparison
            description: `Assert that ${payload.selector} ${payload.assertionType} ${payload.assertionValue ? `"${payload.assertionValue}"` : ''}`,
            timestamp: payload.timestamp || Date.now(),
            status: 'idle',
            assertionType: payload.assertionType,
            assertionValue: payload.assertionValue,
        };
        this.addStep(step);
        this.log('info', `Added assertion: ${step.description}`, step.id);
    }
    updateStep(updatedStep) {
        const index = this.steps.findIndex((s) => s.id === updatedStep.id);
        if (index !== -1) {
            this.steps[index] = updatedStep;
            event_bus_1.eventBus.emit('step:updated', updatedStep);
        }
    }
    deleteStep(stepId) {
        this.steps = this.steps.filter((s) => s.id !== stepId);
        event_bus_1.eventBus.emit('step:deleted', stepId);
    }
    reorderSteps(stepIds) {
        const stepMap = new Map(this.steps.map((s) => [s.id, s]));
        this.steps = stepIds
            .map((id) => stepMap.get(id))
            .filter((s) => s !== undefined);
        event_bus_1.eventBus.emit('step:reordered', stepIds);
    }
    /* ---- Private ---- */
    async injectRecorder() {
        const wc = this.browserManager.getWebContents();
        if (!wc)
            return;
        try {
            const script = (0, inject_script_1.getInjectScript)();
            await wc.executeJavaScript(script);
            console.log('[RecorderEngine] Injected recorder script');
        }
        catch (error) {
            console.error('[RecorderEngine] Failed to inject script:', error);
        }
    }
    processRecorderEvent(event) {
        if (!this.isRecording || this.isPaused)
            return;
        const lastStep = this.steps[this.steps.length - 1];
        if (lastStep &&
            lastStep.action === event.type &&
            lastStep.selector === event.selector &&
            lastStep.value === event.value &&
            event.timestamp - lastStep.timestamp < 300) {
            return;
        }
        const step = this.createStepFromEvent(event);
        this.addStep(step);
        this.log('info', 'Recorded: ' + event.type + ' on ' + event.selector, step.id);
    }
    createStepFromEvent(event) {
        const meta = {};
        if (event.tagName) {
            meta.tagName = event.tagName;
        }
        if (event.innerText) {
            meta.innerText = event.innerText;
        }
        if (event.attributes && Object.keys(event.attributes).length > 0) {
            meta.attributes = event.attributes;
        }
        const selectorCandidates = this.buildSelectorCandidates(event);
        if (selectorCandidates.length > 0) {
            meta.selectorCandidates = selectorCandidates;
        }
        const step = {
            id: (0, uuid_1.v4)(),
            action: event.type,
            selector: event.selector,
            value: event.value,
            description: this.describeStep(event.type, event.selector, event.value),
            timestamp: event.timestamp,
            status: 'idle',
        };
        if (Object.keys(meta).length > 0) {
            step.meta = meta;
        }
        return step;
    }
    buildSelectorCandidates(event) {
        const candidates = [];
        const attrs = event.attributes ?? {};
        const tag = event.tagName && event.tagName.length > 0 ? event.tagName : '*';
        /* Strategy 1: data-testid (Highest confidence) */
        const dataTestId = attrs['data-testid'] ?? attrs['data-test-id'];
        if (dataTestId) {
            candidates.push({
                strategy: 'data-testid',
                value: `[data-testid="${dataTestId}"]`,
                confidence: 0.95,
            });
        }
        /* Strategy 2: ID */
        if (attrs.id) {
            candidates.push({
                strategy: 'id',
                value: `#${attrs.id}`,
                confidence: 0.9,
            });
        }
        /* Strategy 3: Playwright getByRole (Modern, accessibility-first) */
        if (attrs.role) {
            // Basic implementation - ideally needs more context about name/aria-label
            // This is simplified. Real getByRole requires matching accessible name.
            const role = attrs.role;
            const name = attrs['aria-label'] || attrs['name'] || event.innerText;
            if (name) {
                candidates.push({
                    strategy: 'getByRole',
                    value: `getByRole('${role}', { name: '${name.substring(0, 30)}' })`,
                    confidence: 0.88
                });
            }
            else {
                candidates.push({
                    strategy: 'getByRole',
                    value: `getByRole('${role}')`,
                    confidence: 0.85
                });
            }
        }
        /* Strategy 4: Text Content (Good for buttons/links) */
        if (event.innerText && event.innerText.length <= 50) {
            // Prefer getByText for Playwright
            candidates.push({
                strategy: 'getByText',
                value: `getByText('${event.innerText}')`,
                confidence: 0.82
            });
            // Fallback to :has-text css
            if (event.tagName) {
                candidates.push({
                    strategy: 'text',
                    value: `${event.tagName}:has-text("${event.innerText}")`,
                    confidence: 0.75,
                });
            }
        }
        /* Strategy 5: Aria Label */
        const ariaLabel = attrs['aria-label'];
        if (ariaLabel) {
            candidates.push({
                strategy: 'aria-label',
                value: `${tag}[aria-label="${ariaLabel}"]`,
                confidence: 0.85,
            });
        }
        /* Strategy 6: Name Attribute */
        const nameAttr = attrs.name;
        if (nameAttr && event.tagName) {
            candidates.push({
                strategy: 'name',
                value: `${event.tagName}[name="${nameAttr}"]`,
                confidence: 0.8,
            });
        }
        /* Strategy 7: Placeholder */
        if (attrs.placeholder) {
            candidates.push({
                strategy: 'css', // or getByPlaceholder
                value: `[placeholder="${attrs.placeholder}"]`,
                confidence: 0.78
            });
        }
        /* Strategy 8: Recorder provided CSS (often too specific or absolute) */
        if (event.selector) {
            candidates.push({
                strategy: 'css',
                value: event.selector,
                confidence: 0.6,
            });
        }
        /* Sort by confidence desc */
        candidates.sort((a, b) => b.confidence - a.confidence);
        const seen = new Set();
        return candidates.filter((candidate) => {
            if (seen.has(candidate.value)) {
                return false;
            }
            seen.add(candidate.value);
            return true;
        });
    }
    createStep(action, selector, value) {
        return {
            id: (0, uuid_1.v4)(),
            action,
            selector,
            value,
            description: this.describeStep(action, selector, value),
            timestamp: Date.now(),
            status: 'idle',
        };
    }
    describeStep(action, selector, value) {
        switch (action) {
            case 'click': return 'Click on ' + selector;
            case 'dblclick': return 'Double-click on ' + selector;
            case 'input': return 'Type "' + (value || '') + '" into ' + selector;
            case 'navigate': return 'Navigate to ' + (value || selector);
            case 'keydown': return 'Press ' + (value || 'key') + ' on ' + selector;
            case 'select': return 'Select "' + (value || '') + '" in ' + selector;
            case 'check': return 'Check ' + selector;
            case 'uncheck': return 'Uncheck ' + selector;
            case 'change': return 'Change ' + selector + ' to "' + (value || '') + '"';
            default: return action + ' on ' + selector;
        }
    }
    log(level, message, stepId) {
        const entry = {
            id: (0, uuid_1.v4)(),
            level,
            message,
            timestamp: Date.now(),
            source: 'recorder',
        };
        if (stepId) {
            entry.stepId = stepId;
        }
        event_bus_1.eventBus.emit('log', entry);
        this.mainWindow.webContents.send(ipc_channels_1.IpcChannels.LOG_EVENT, entry);
    }
    setupIpcListeners() {
        electron_1.ipcMain.on(ipc_channels_1.IpcChannels.RECORDER_EVENT_FROM_PAGE, (_event, data) => {
            console.log('[RecorderEngine] Received event from page:', data.type, data.selector);
            this.processRecorderEvent(data);
        });
    }
}
exports.RecorderEngine = RecorderEngine;
//# sourceMappingURL=recorder-engine.js.map