/**
 * Application-wide constants.
 */

export const APP_NAME = 'Playwright IDE';
export const APP_VERSION = '0.1.0';

/** Default project configuration */
export const DEFAULT_PROJECT_CONFIG = {
  name: 'Untitled Project',
  version: '1.0.0',
  baseUrl: 'https://example.com',
  browser: 'chromium' as const,
  browserType: 'chromium' as const,
  headless: false,
  viewport: { width: 1280, height: 720 },
  timeout: 30000,
};

/** Default window dimensions */
export const WINDOW_CONFIG = {
  width: 1440,
  height: 900,
  minWidth: 1024,
  minHeight: 700,
};

/** Selector strategy priority order */
export const SELECTOR_PRIORITY: readonly string[] = [
  'data-testid',
  'id',
  'aria-label',
  'name',
  'role',
  'text',
  'css',
] as const;

/** Action display labels */
export const ACTION_LABELS: Record<string, string> = {
  click: 'Click',
  dblclick: 'Double Click',
  input: 'Type',
  change: 'Change',
  keydown: 'Key Press',
  navigate: 'Navigate',
  select: 'Select',
  check: 'Check',
  uncheck: 'Uncheck',
  hover: 'Hover',
  scroll: 'Scroll',
  wait: 'Wait',
  assert: 'Assert',
  screenshot: 'Screenshot',
};

/** Vite dev server URL (used during development) */
export const DEV_SERVER_URL = 'http://localhost:5173';

export const BROWSER_TYPES = ['chromium', 'firefox', 'webkit'] as const;

export const DEFAULT_CDP_PORTS: readonly number[] = [
  9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232,
];
