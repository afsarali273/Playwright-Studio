/**
 * BrowserManager — Manages the embedded BrowserView inside the Electron window.
 * Handles creation, navigation, bounds, and lifecycle of the browsing surface.
 */
import { BrowserView, BrowserWindow } from 'electron';
import type { BrowserBounds, BrowserTarget, BrowserType, ExternalBrowserInfo } from '../../shared/types';
export declare class BrowserManager {
    private browserView;
    private mainWindow;
    private browserType;
    private target;
    private currentBounds;
    constructor(mainWindow: BrowserWindow);
    /**
     * Create and attach a BrowserView to the main window.
     * Uses a dedicated preload script for recorder communication.
     */
    create(bounds?: BrowserBounds): BrowserView;
    /** Remove and destroy the BrowserView */
    destroy(): void;
    navigate(url: string): Promise<void>;
    goBack(): Promise<void>;
    goForward(): Promise<void>;
    reload(): Promise<void>;
    hide(): void;
    show(): void;
    getView(): BrowserView | null;
    getWebContents(): Electron.WebContents | null;
    getCurrentUrl(): string;
    setBounds(bounds: BrowserBounds): void;
    setBrowserType(type: BrowserType): void;
    getBrowserType(): BrowserType;
    getTarget(): BrowserTarget | null;
    discoverExternalBrowsers(): Promise<ExternalBrowserInfo[]>;
    executeScript(script: string): Promise<unknown>;
    validateLocator(locator: string): Promise<{
        count: number;
        error?: string;
    }>;
    private setupListeners;
    private queryCdpPort;
    private fetchTabCount;
    private inferExternalType;
}
//# sourceMappingURL=browser-manager.d.ts.map