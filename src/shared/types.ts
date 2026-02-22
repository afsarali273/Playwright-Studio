/**
 * Shared types for the Playwright IDE application.
 * Used by both main and renderer processes.
 */

/* ------------------------------------------------------------------ */
/*  Test Step Model                                                    */
/* ------------------------------------------------------------------ */

/** All supported step action types */
export type StepAction =
  | 'click'
  | 'dblclick'
  | 'input'
  | 'change'
  | 'keydown'
  | 'navigate'
  | 'select'
  | 'check'
  | 'uncheck'
  | 'hover'
  | 'scroll'
  | 'wait'
  | 'assert'
  | 'screenshot';

/** Execution status of a single step */
export type StepStatus =
  | 'idle'
  | 'running'
  | 'passed'
  | 'failed'
  | 'skipped';

/** A single test step in the step list */
export interface TestStep {
  id: string;
  action: StepAction;
  selector: string;
  value?: string;
  description?: string;
  timestamp: number;
  status: StepStatus;
  error?: string;
  screenshot?: string;
  meta?: Record<string, unknown>;
  assertionType?: 'toBeVisible' | 'toHaveText' | 'toHaveValue' | 'toContainText' | 'toHaveAttribute' | 'toHaveCount';
  assertionValue?: string;
}

/* ------------------------------------------------------------------ */
/*  Recorder Event (from injected page script)                         */
/* ------------------------------------------------------------------ */

export interface RecorderEvent {
  id: string;
  type: StepAction;
  selector: string;
  value?: string;
  timestamp: number;
  url?: string;
  tagName?: string;
  innerText?: string;
  attributes?: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Selector Strategy                                                  */
/* ------------------------------------------------------------------ */

export type SelectorStrategy =
  | 'data-testid'
  | 'id'
  | 'aria-label'
  | 'name'
  | 'role'
  | 'text'
  | 'css'
  | 'xpath'
  | 'relative-xpath'
  | 'complex-xpath'
  | 'getByRole'
  | 'getByText'
  | 'getByTestId';

export interface SelectorCandidate {
  strategy: SelectorStrategy;
  value: string;
  confidence: number;
}

/* ------------------------------------------------------------------ */
/*  Runner                                                             */
/* ------------------------------------------------------------------ */

export type RunnerStatus =
  | 'idle'
  | 'running'
  | 'paused'
  | 'stopped'
  | 'completed'
  | 'error';

export type RunMode = 'all' | 'from' | 'single';

export interface RunRequest {
  mode: RunMode;
  stepId?: string;
}

export interface RunResult {
  stepId: string;
  status: StepStatus;
  duration: number;
  error?: string;
  screenshot?: string;
}

/* ------------------------------------------------------------------ */
/*  Logging                                                            */
/* ------------------------------------------------------------------ */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: number;
  source: 'recorder' | 'runner' | 'system' | 'browser';
  stepId?: string;
  details?: string;
}

/* ------------------------------------------------------------------ */
/*  Project                                                            */
/* ------------------------------------------------------------------ */

export type BrowserType = 'chromium' | 'firefox' | 'webkit';

export interface ProjectConfig {
  name: string;
  version: string;
  baseUrl: string;
  browser?: BrowserType;
  browserType: BrowserType;
  headless: boolean;
  viewport: { width: number; height: number };
  timeout: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectData {
  config: ProjectConfig;
  steps: TestStep[];
}

/* ------------------------------------------------------------------ */
/*  Browser Types                                                      */
/* ------------------------------------------------------------------ */

export type BrowserConnectionMode = 'launch' | 'attach';

export interface ExternalBrowserInfo {
  id: string;
  name: string;
  wsEndpoint: string;
  port: number;
  type: 'chrome' | 'edge' | 'chromium';
  tabs: number;
}

export interface BrowserTarget {
  mode: BrowserConnectionMode;
  browserType: BrowserType;
  externalBrowser?: ExternalBrowserInfo;
}

/* ------------------------------------------------------------------ */
/*  Browser Bounds (for BrowserView positioning)                       */
/* ------------------------------------------------------------------ */

export interface BrowserBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/* ------------------------------------------------------------------ */
/*  Plugin System                                                      */
/* ------------------------------------------------------------------ */

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  hooks: string[];
}

export type PluginHook =
  | 'beforeRecord'
  | 'afterRecord'
  | 'beforeRun'
  | 'afterRun'
  | 'beforeStep'
  | 'afterStep'
  | 'onExport';

export interface PluginContext {
  steps: TestStep[];
  currentStep?: TestStep;
  config: ProjectConfig;
}

export interface IPlugin {
  manifest: PluginManifest;
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;
  onHook(hook: PluginHook, context: PluginContext): Promise<PluginContext>;
}

/* ------------------------------------------------------------------ */
/*  IPC Payloads                                                       */
/* ------------------------------------------------------------------ */

export interface StepUpdatePayload {
  stepId: string;
  status: StepStatus;
  error?: string;
}

export interface RecorderStatusPayload {
  recording: boolean;
  paused?: boolean;
  url?: string;
}

export interface RunnerStatusPayload {
  status: RunnerStatus;
  currentStepId?: string;
  progress?: { completed: number; total: number };
}

export interface InspectorPayload {
  tagName?: string;
  innerText?: string;
  attributes?: Record<string, string>;
  candidates: SelectorCandidate[];
  rect?: { x: number; y: number; width: number; height: number };
  computedStyle?: Record<string, string>;
  isVisible?: boolean;
}
