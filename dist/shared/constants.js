"use strict";
/**
 * Application-wide constants.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CDP_PORTS = exports.BROWSER_TYPES = exports.DEV_SERVER_URL = exports.ACTION_LABELS = exports.SELECTOR_PRIORITY = exports.WINDOW_CONFIG = exports.DEFAULT_PROJECT_CONFIG = exports.APP_VERSION = exports.APP_NAME = void 0;
exports.APP_NAME = 'Playwright IDE';
exports.APP_VERSION = '0.1.0';
/** Default project configuration */
exports.DEFAULT_PROJECT_CONFIG = {
    name: 'Untitled Project',
    version: '1.0.0',
    baseUrl: 'https://example.com',
    browser: 'chromium',
    browserType: 'chromium',
    headless: false,
    viewport: { width: 1280, height: 720 },
    timeout: 30000,
};
/** Default window dimensions */
exports.WINDOW_CONFIG = {
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
};
/** Selector strategy priority order */
exports.SELECTOR_PRIORITY = [
    'data-testid',
    'id',
    'aria-label',
    'name',
    'role',
    'text',
    'css',
];
/** Action display labels */
exports.ACTION_LABELS = {
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
exports.DEV_SERVER_URL = 'http://localhost:5173';
exports.BROWSER_TYPES = ['chromium', 'firefox', 'webkit'];
exports.DEFAULT_CDP_PORTS = [
    9222, 9223, 9224, 9225, 9226, 9227, 9228, 9229, 9230, 9231, 9232,
];
//# sourceMappingURL=constants.js.map