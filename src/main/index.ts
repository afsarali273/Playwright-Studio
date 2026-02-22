/**
 * Main Electron Process - Entry point for the Playwright IDE application.
 * Creates the main window, initializes all engines, and registers IPC handlers.
 */

import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { BrowserManager } from './core/browser-manager';
import { RecorderEngine } from './recorder/recorder-engine';
import { RunnerEngine } from './runner/runner-engine';
import { ProjectManager } from './storage/project-manager';
import { ScriptGenerator } from './generator/script-generator';
import { PluginManager, ConsoleLogPlugin } from './plugins/plugin-interface';
import { registerIpcHandlers } from './ipc/handlers';
import { eventBus } from './core/event-bus';
import { WINDOW_CONFIG, APP_NAME, DEV_SERVER_URL } from '../shared/constants';

/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */

let mainWindow: BrowserWindow | null = null;
let browserManager: BrowserManager;
let recorderEngine: RecorderEngine;
let runnerEngine: RunnerEngine;
let projectManager: ProjectManager;
let scriptGenerator: ScriptGenerator;
let pluginManager: PluginManager;

// isDev = true  → load Vite dev server (localhost:5173)
// isDev = false → load dist/renderer/index.html (packaged build or NODE_ENV=production)
const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

/* ------------------------------------------------------------------ */
/*  Window Creation                                                    */
/* ------------------------------------------------------------------ */

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.width,
    height: WINDOW_CONFIG.height,
    minWidth: WINDOW_CONFIG.minWidth,
    minHeight: WINDOW_CONFIG.minHeight,
    title: APP_NAME,
    backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload-main.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,                // allows file:// assets to load cross-origin
    },
  });

  /* Load the renderer */
  if (isDev) {
    await mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // app.getAppPath() → root of the asar on all platforms (mac, win, linux)
    // path.join handles separators correctly (/ on mac/linux, \ on windows)
    const indexPath = path.join(app.getAppPath(), 'dist', 'renderer', 'index.html');
    console.log('[Main] Loading renderer from:', indexPath);
    await mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /* Open external links in the default browser */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/* ------------------------------------------------------------------ */
/*  Engine Initialization                                              */
/* ------------------------------------------------------------------ */

function initializeEngines(): void {
  if (!mainWindow) throw new Error('Main window not created');

  browserManager = new BrowserManager(mainWindow);
  recorderEngine = new RecorderEngine(mainWindow, browserManager);
  runnerEngine = new RunnerEngine(mainWindow);
  projectManager = new ProjectManager();
  scriptGenerator = new ScriptGenerator();
  pluginManager = new PluginManager();

  /* Register built-in plugins */
  pluginManager.register(new ConsoleLogPlugin());

  /* Register all IPC handlers */
  registerIpcHandlers(mainWindow, {
    recorder: recorderEngine,
    runner: runnerEngine,
    projectManager,
    scriptGenerator,
    browserManager,
  });

  /* Forward event bus logs to the renderer */
  eventBus.on('log', (entry) => {
    mainWindow?.webContents.send('log:event', entry);
  });

  /* Open browser with blank tab by default */
  setTimeout(() => {
    // We need to wait a bit for the renderer to report bounds, 
    // but we can initialize with default bounds and it will be resized.
    // Actually, better to just navigate to about:blank which will trigger creation.
    browserManager.navigate('about:blank');
  }, 1000);
}

/* ------------------------------------------------------------------ */
/*  Application Menu                                                   */
/* ------------------------------------------------------------------ */

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-project'),
        },
        {
          label: 'Open Project',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-project'),
        },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save-project'),
        },
        { type: 'separator' },
        {
          label: 'Export Test Script',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:export'),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Playwright Documentation',
          click: () => shell.openExternal('https://playwright.dev'),
        },
        {
          label: 'About',
          click: () => {
            /* Show about dialog */
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/* ------------------------------------------------------------------ */
/*  App Lifecycle                                                      */
/* ------------------------------------------------------------------ */

app.whenReady().then(async () => {
  createMenu();
  await createMainWindow();
  initializeEngines();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createMainWindow();
    initializeEngines();
  }
});

app.on('before-quit', () => {
  eventBus.removeAllListeners();
});
