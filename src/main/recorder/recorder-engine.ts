/**
 * RecorderEngine - Orchestrates the recording workflow.
 * Creates the browser view, injects recorder script, processes events,
 * and converts raw DOM events into structured TestSteps.
 */

import { BrowserWindow, ipcMain } from 'electron';
import { BrowserManager } from '../core/browser-manager';
import { eventBus } from '../core/event-bus';
import { getInjectScript } from './inject-script';
import { IpcChannels } from '../../shared/ipc-channels';
import type {
  RecorderEvent,
  TestStep,
  BrowserBounds,
  LogEntry,
  SelectorCandidate,
} from '../../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class RecorderEngine {
  private browserManager: BrowserManager;
  private mainWindow: BrowserWindow;
  private isRecording = false;
  private isPaused = false;
  private steps: TestStep[] = [];
  private onDidFinishLoad: (() => void) | null = null;
  private onDomReady: (() => void) | null = null;

  constructor(mainWindow: BrowserWindow, browserManager: BrowserManager) {
    this.mainWindow = mainWindow;
    this.browserManager = browserManager;
    this.setupIpcListeners();
  }

  /** Start recording on a given URL */
  async start(url?: string): Promise<void> {
    if (this.isRecording) {
      this.log('warn', 'Already recording. Stop first.');
      return;
    }
    this.isRecording = true;
    this.isPaused = false;

    // Use existing view if available, or create with default bounds
    if (!this.browserManager.getView()) {
      const defaultBounds: BrowserBounds = { x: 300, y: 50, width: 800, height: 650 };
      this.browserManager.create(defaultBounds);
    }

    // Determine target URL
    const currentUrl = this.browserManager.getCurrentUrl();
    let targetUrl = url;

    if (!targetUrl) {
      if (currentUrl && currentUrl !== 'about:blank') {
        targetUrl = currentUrl;
      } else {
        targetUrl = 'https://google.com';
      }
    }

    // Only navigate if the URL is different or if it's the initial empty state
    if (!currentUrl || currentUrl === 'about:blank' || (url && currentUrl !== url)) {
        await this.browserManager.navigate(targetUrl);
    } else {
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

    this.mainWindow.webContents.send(IpcChannels.RECORDER_STATUS, {
      recording: true,
      paused: false,
      url: targetUrl,
    });
    eventBus.emit('recorder:started', { url: targetUrl });
    this.log('info', 'Recording started on ' + targetUrl);
  }

  /** Stop recording */
  stop(): void {
    if (!this.isRecording) return;
    this.isRecording = false;
    this.isPaused = false;
    this.cleanupListeners();

    this.mainWindow.webContents.send(IpcChannels.RECORDER_STATUS, {
      recording: false,
      paused: false,
    });
    eventBus.emit('recorder:stopped', undefined as unknown as void);
    this.log('info', 'Recording stopped');
  }

  pause(): void {
    if (!this.isRecording || this.isPaused) return;
    this.isPaused = true;

    this.mainWindow.webContents.send(IpcChannels.RECORDER_STATUS, {
      recording: true,
      paused: true,
    });
    eventBus.emit('recorder:paused', undefined as unknown as void);
    this.log('info', 'Recording paused');
  }

  resume(): void {
    if (!this.isRecording || !this.isPaused) return;
    this.isPaused = false;

    this.mainWindow.webContents.send(IpcChannels.RECORDER_STATUS, {
      recording: true,
      paused: false,
    });
    eventBus.emit('recorder:resumed', undefined as unknown as void);
    this.log('info', 'Recording resumed');
  }

  private cleanupListeners(): void {
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

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getSteps(): TestStep[] {
    return [...this.steps];
  }

  setSteps(steps: TestStep[]): void {
    this.steps = [...steps];
  }

  clearSteps(): void {
    this.steps = [];
  }

  addStep(step: TestStep): void {
    this.steps.push(step);
    this.mainWindow.webContents.send(IpcChannels.STEP_ADDED, step);
    eventBus.emit('step:added', step);
  }

  addAssertionStep(payload: { selector: string; assertionType: string; assertionValue?: string; timestamp: number }): void {
    const step: TestStep = {
      id: uuidv4(),
      action: 'assert',
      selector: payload.selector,
      value: payload.assertionValue, // store value if needed for comparison
      description: `Assert that ${payload.selector} ${payload.assertionType} ${payload.assertionValue ? `"${payload.assertionValue}"` : ''}`,
      timestamp: payload.timestamp || Date.now(),
      status: 'idle',
      assertionType: payload.assertionType as any,
      assertionValue: payload.assertionValue,
    };
    this.addStep(step);
    this.log('info', `Added assertion: ${step.description}`, step.id);
  }

  updateStep(updatedStep: TestStep): void {
    const index = this.steps.findIndex((s) => s.id === updatedStep.id);
    if (index !== -1) {
      this.steps[index] = updatedStep;
      eventBus.emit('step:updated', updatedStep);
    }
  }

  deleteStep(stepId: string): void {
    this.steps = this.steps.filter((s) => s.id !== stepId);
    eventBus.emit('step:deleted', stepId);
  }

  reorderSteps(stepIds: string[]): void {
    const stepMap = new Map(this.steps.map((s) => [s.id, s]));
    this.steps = stepIds
      .map((id) => stepMap.get(id))
      .filter((s): s is TestStep => s !== undefined);
    eventBus.emit('step:reordered', stepIds);
  }

  /* ---- Private ---- */

  private async injectRecorder(): Promise<void> {
    const wc = this.browserManager.getWebContents();
    if (!wc) return;

    try {
      const script = getInjectScript();
      await wc.executeJavaScript(script);
      console.log('[RecorderEngine] Injected recorder script');
    } catch (error) {
      console.error('[RecorderEngine] Failed to inject script:', error);
    }
  }

  private processRecorderEvent(event: RecorderEvent): void {
    if (!this.isRecording || this.isPaused) return;

    const lastStep = this.steps[this.steps.length - 1];
    if (
      lastStep &&
      lastStep.action === event.type &&
      lastStep.selector === event.selector &&
      lastStep.value === event.value &&
      event.timestamp - lastStep.timestamp < 300
    ) {
      return;
    }

    const step = this.createStepFromEvent(event);
    this.addStep(step);
    this.log('info', 'Recorded: ' + event.type + ' on ' + event.selector, step.id);
  }

  private createStepFromEvent(event: RecorderEvent): TestStep {
    const meta: Record<string, unknown> = {};

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
      (meta as Record<string, unknown>).selectorCandidates = selectorCandidates;
    }

    const step: TestStep = {
      id: uuidv4(),
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

  private buildSelectorCandidates(event: RecorderEvent): SelectorCandidate[] {
    const candidates: SelectorCandidate[] = [];
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
      } else {
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

    const seen = new Set<string>();
    return candidates.filter((candidate) => {
      if (seen.has(candidate.value)) {
        return false;
      }
      seen.add(candidate.value);
      return true;
    });
  }

  private createStep(
    action: TestStep['action'],
    selector: string,
    value?: string,
  ): TestStep {
    return {
      id: uuidv4(),
      action,
      selector,
      value,
      description: this.describeStep(action, selector, value),
      timestamp: Date.now(),
      status: 'idle',
    };
  }

  private describeStep(action: string, selector: string, value?: string): string {
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

  private log(level: LogEntry['level'], message: string, stepId?: string): void {
    const entry: LogEntry = {
      id: uuidv4(),
      level,
      message,
      timestamp: Date.now(),
      source: 'recorder',
    };
    if (stepId) {
      entry.stepId = stepId;
    }
    eventBus.emit('log', entry);
    this.mainWindow.webContents.send(IpcChannels.LOG_EVENT, entry);
  }

  private setupIpcListeners(): void {
    ipcMain.on(IpcChannels.RECORDER_EVENT_FROM_PAGE, (_event, data: RecorderEvent) => {
      console.log('[RecorderEngine] Received event from page:', data.type, data.selector);
      this.processRecorderEvent(data);
    });
  }
}
