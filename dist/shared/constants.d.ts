/**
 * Application-wide constants.
 */
export declare const APP_NAME = "Playwright IDE";
export declare const APP_VERSION = "0.1.0";
/** Default project configuration */
export declare const DEFAULT_PROJECT_CONFIG: {
    name: string;
    version: string;
    baseUrl: string;
    browser: "chromium";
    browserType: "chromium";
    headless: boolean;
    viewport: {
        width: number;
        height: number;
    };
    timeout: number;
};
/** Default window dimensions */
export declare const WINDOW_CONFIG: {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
};
/** Selector strategy priority order */
export declare const SELECTOR_PRIORITY: readonly string[];
/** Action display labels */
export declare const ACTION_LABELS: Record<string, string>;
/** Vite dev server URL (used during development) */
export declare const DEV_SERVER_URL = "http://localhost:5173";
export declare const BROWSER_TYPES: readonly ["chromium", "firefox", "webkit"];
export declare const DEFAULT_CDP_PORTS: readonly number[];
//# sourceMappingURL=constants.d.ts.map