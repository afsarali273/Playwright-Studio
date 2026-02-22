/**
 * BrowserManager — Manages the embedded BrowserView inside the Electron window.
 * Handles creation, navigation, bounds, and lifecycle of the browsing surface.
 */

import { BrowserView, BrowserWindow } from 'electron';
import path from 'path';
import http from 'http';
import { eventBus } from './event-bus';
import type {
  BrowserBounds,
  BrowserTarget,
  BrowserType,
  ExternalBrowserInfo,
} from '../../shared/types';
import { DEFAULT_CDP_PORTS } from '../../shared/constants';

export class BrowserManager {
  private browserView: BrowserView | null = null;
  private mainWindow: BrowserWindow;
  private browserType: BrowserType = 'chromium';
  private target: BrowserTarget | null = null;
  private currentBounds: BrowserBounds | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.target = {
      mode: 'launch',
      browserType: this.browserType,
    };
  }

  /* ---------------------------------------------------------------- */
  /*  Lifecycle                                                        */
  /* ---------------------------------------------------------------- */

  /**
   * Create and attach a BrowserView to the main window.
   * Uses a dedicated preload script for recorder communication.
   */
  create(bounds?: BrowserBounds): BrowserView {
    // Cache the provided bounds or use stored ones
    if (bounds) {
      this.currentBounds = bounds;
    }

    if (this.browserView) {
      this.destroy();
    }

    this.browserView = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, '../preload-browser.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    this.mainWindow.addBrowserView(this.browserView);
    
    // Use cached bounds if available, otherwise use provided (or default)
    const initialBounds = this.currentBounds ?? bounds;
    if (initialBounds) {
       this.browserView.setBounds(initialBounds);
    }

    this.browserView.setAutoResize({
      width: true,
      height: true,
      horizontal: false,
      vertical: false,
    });

    this.browserView.webContents.setWindowOpenHandler(({ url }) => {
      console.log('[BrowserManager] Window open intercepted:', url);
      // Force navigation in the same BrowserView instead of opening a new window
      this.navigate(url);
      return { action: 'deny' };
    });

    this.browserView.webContents.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    this.setupListeners();
    return this.browserView;
  }

  /** Remove and destroy the BrowserView */
  destroy(): void {
    if (this.browserView) {
      this.mainWindow.removeBrowserView(this.browserView);
      /* Cast to access destroy method — available at runtime */
      (this.browserView.webContents as unknown as { destroy(): void }).destroy?.();
      this.browserView = null;
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Navigation                                                       */
  /* ---------------------------------------------------------------- */

  async navigate(url: string): Promise<void> {
    // Auto-create if not exists
    if (!this.browserView) {
      if (this.currentBounds) {
        this.create(this.currentBounds);
      } else {
        // Fallback default bounds if not yet reported
        this.create({ x: 0, y: 0, width: 800, height: 600 });
      }
    }

    if (!this.browserView) return;

    let normalizedUrl = url;
    if (url === 'about:blank') {
      normalizedUrl = url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    await this.browserView.webContents.loadURL(normalizedUrl);
  }

  async goBack(): Promise<void> {
    if (this.browserView?.webContents.canGoBack()) {
      this.browserView.webContents.goBack();
    }
  }

  async goForward(): Promise<void> {
    if (this.browserView?.webContents.canGoForward()) {
      this.browserView.webContents.goForward();
    }
  }

  async reload(): Promise<void> {
    this.browserView?.webContents.reload();
  }

  /* ---------------------------------------------------------------- */
  /*  Visibility                                                       */
  /* ---------------------------------------------------------------- */

  hide(): void {
    if (this.browserView) {
      this.mainWindow.removeBrowserView(this.browserView);
    }
  }

  show(): void {
    if (this.browserView) {
      this.mainWindow.addBrowserView(this.browserView);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  BrowserView accessors                                            */
  /* ---------------------------------------------------------------- */

  getView(): BrowserView | null {
    return this.browserView;
  }

  getWebContents() {
    return this.browserView?.webContents ?? null;
  }

  getCurrentUrl(): string {
    return this.browserView?.webContents.getURL() ?? '';
  }

  setBounds(bounds: BrowserBounds): void {
    this.currentBounds = bounds; // Cache bounds for future
    if (this.browserView) {
      this.browserView.setBounds(bounds);
    }
  }

  setBrowserType(type: BrowserType): void {
    this.browserType = type;
    this.target = {
      mode: 'launch',
      browserType: type,
    };
  }

  getBrowserType(): BrowserType {
    return this.browserType;
  }

  getTarget(): BrowserTarget | null {
    return this.target;
  }

  async discoverExternalBrowsers(): Promise<ExternalBrowserInfo[]> {
    const ports = DEFAULT_CDP_PORTS;
    const results: ExternalBrowserInfo[] = [];

    const queries = ports.map((port) =>
      this.queryCdpPort(port).then((info) => {
        if (info) {
          results.push(info);
        }
      }),
    );

    await Promise.all(queries);
    return results;
  }

  /* ---------------------------------------------------------------- */
  /*  Inspector                                                        */
  /* ---------------------------------------------------------------- */

  async executeScript(script: string): Promise<unknown> {
    // If no view exists, create one silently to support standalone inspection
    if (!this.browserView) {
      if (this.currentBounds) {
        this.create(this.currentBounds);
      } else {
        this.create({ x: 0, y: 0, width: 800, height: 600 });
      }
    }
    
    // Inject the recorder/inspector script if not already present
    // This ensures standalone inspection works even without recording mode
    // We check if we are enabling inspector or validating
    if (script.includes('__playwrightInspectorActive') || script.includes('__playwrightValidateLocator')) {
         try {
             // We need to inject!
             // We must import getInjectScript. To avoid circular dependency issues in this specific file structure,
             // we might need to refactor or pass it in.
             // BUT, let's look at how RecorderEngine does it. It imports getInjectScript.
             // BrowserManager shouldn't really depend on recorder/inject-script.ts ideally, but for now let's do a dynamic require or move the script to shared?
             // Let's try to require it dynamically to avoid top-level cycle if any.
             const { getInjectScript } = require('../recorder/inject-script');
             
             // Check if already injected by checking for __playwrightRecorderActive global
             const isPresent = await this.browserView!.webContents.executeJavaScript("typeof window.__playwrightRecorderActive !== 'undefined'");
             
             if (!isPresent) {
                 await this.browserView!.webContents.executeJavaScript(getInjectScript());
             }
         } catch(e) {
             console.error('[BrowserManager] Failed to ensure inspector script:', e);
         }
    }

    if (!this.browserView) return; 
    return this.browserView.webContents.executeJavaScript(script);
  }

  async validateLocator(locator: string): Promise<{ count: number; error?: string }> {
    if (!this.browserView) {
      return { count: 0, error: 'Browser not active' };
    }
    try {
      // Escape the locator string for safe injection
      const escaped = locator.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return await this.browserView.webContents.executeJavaScript(
        `window.__playwrightValidateLocator('${escaped}')`
      );
    } catch (e) {
      return { count: 0, error: (e as Error).message };
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Internal                                                         */
  /* ---------------------------------------------------------------- */

  private setupListeners(): void {
    if (!this.browserView) return;

    const wc = this.browserView.webContents;

    wc.on('did-navigate', (_event, url) => {
      const title = wc.getTitle();
      eventBus.emit('browser:navigated', { url, title });
    });

    wc.on('did-navigate-in-page', (_event, url) => {
      const title = wc.getTitle();
      eventBus.emit('browser:navigated', { url, title });
    });

    wc.on('page-title-updated', (_event, title) => {
      const url = wc.getURL();
      eventBus.emit('browser:navigated', { url, title });
    });
  }

  private queryCdpPort(port: number): Promise<ExternalBrowserInfo | null> {
    return new Promise((resolve) => {
      const req = http.get(
        {
          host: '127.0.0.1',
          port,
          path: '/json/version',
          timeout: 500,
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            resolve(null);
            return;
          }

          let raw = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            raw += chunk;
          });
          res.on('end', () => {
            try {
              const data = JSON.parse(raw) as {
                Browser?: string;
                webSocketDebuggerUrl?: string;
              };
              if (!data.webSocketDebuggerUrl) {
                resolve(null);
                return;
              }
              const wsEndpoint = data.webSocketDebuggerUrl;
              this.fetchTabCount(port)
                .then((tabs) => {
                  const name = data.Browser ?? 'Chromium';
                  const type = this.inferExternalType(name);
                  const info: ExternalBrowserInfo = {
                    id: `${port}-${wsEndpoint}`,
                    name,
                    wsEndpoint,
                    port,
                    type,
                    tabs,
                  };
                  resolve(info);
                })
                .catch(() => {
                  const name = data.Browser ?? 'Chromium';
                  const type = this.inferExternalType(name);
                  const info: ExternalBrowserInfo = {
                    id: `${port}-${wsEndpoint}`,
                    name,
                    wsEndpoint,
                    port,
                    type,
                    tabs: 0,
                  };
                  resolve(info);
                });
            } catch {
              resolve(null);
            }
          });
        },
      );

      req.on('error', () => {
        resolve(null);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }

  private fetchTabCount(port: number): Promise<number> {
    return new Promise((resolve, reject) => {
      const req = http.get(
        {
          host: '127.0.0.1',
          port,
          path: '/json/list',
          timeout: 500,
        },
        (res) => {
          if (res.statusCode !== 200) {
            res.resume();
            resolve(0);
            return;
          }

          let raw = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            raw += chunk;
          });
          res.on('end', () => {
            try {
              const data = JSON.parse(raw);
              if (Array.isArray(data)) {
                resolve(data.length);
              } else {
                resolve(0);
              }
            } catch (err) {
              reject(err);
            }
          });
        },
      );

      req.on('error', () => {
        resolve(0);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(0);
      });
    });
  }

  private inferExternalType(name: string): ExternalBrowserInfo['type'] {
    const lower = name.toLowerCase();
    if (lower.includes('edge')) {
      return 'edge';
    }
    if (lower.includes('chromium')) {
      return 'chromium';
    }
    return 'chrome';
  }
}
