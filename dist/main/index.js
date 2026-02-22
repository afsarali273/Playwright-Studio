"use strict";
/**
 * Main Electron Process - Entry point for the Playwright IDE application.
 * Creates the main window, initializes all engines, and registers IPC handlers.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const browser_manager_1 = require("./core/browser-manager");
const recorder_engine_1 = require("./recorder/recorder-engine");
const runner_engine_1 = require("./runner/runner-engine");
const project_manager_1 = require("./storage/project-manager");
const script_generator_1 = require("./generator/script-generator");
const plugin_interface_1 = require("./plugins/plugin-interface");
const handlers_1 = require("./ipc/handlers");
const event_bus_1 = require("./core/event-bus");
const constants_1 = require("../shared/constants");
/* ------------------------------------------------------------------ */
/*  State                                                              */
/* ------------------------------------------------------------------ */
let mainWindow = null;
let browserManager;
let recorderEngine;
let runnerEngine;
let projectManager;
let scriptGenerator;
let pluginManager;
const isDev = process.env.NODE_ENV !== 'production';
/* ------------------------------------------------------------------ */
/*  Window Creation                                                    */
/* ------------------------------------------------------------------ */
async function createMainWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: constants_1.WINDOW_CONFIG.width,
        height: constants_1.WINDOW_CONFIG.height,
        minWidth: constants_1.WINDOW_CONFIG.minWidth,
        minHeight: constants_1.WINDOW_CONFIG.minHeight,
        title: constants_1.APP_NAME,
        backgroundColor: '#0f1117',
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload-main.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });
    /* Load the renderer */
    if (isDev) {
        await mainWindow.loadURL(constants_1.DEV_SERVER_URL);
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        // In production (or NODE_ENV=production), load the built index.html
        const indexPath = path_1.default.join(__dirname, '..', 'renderer', 'index.html');
        console.log('[Main] Loading renderer from:', indexPath);
        await mainWindow.loadFile(indexPath);
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    /* Open external links in the default browser */
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
/* ------------------------------------------------------------------ */
/*  Engine Initialization                                              */
/* ------------------------------------------------------------------ */
function initializeEngines() {
    if (!mainWindow)
        throw new Error('Main window not created');
    browserManager = new browser_manager_1.BrowserManager(mainWindow);
    recorderEngine = new recorder_engine_1.RecorderEngine(mainWindow, browserManager);
    runnerEngine = new runner_engine_1.RunnerEngine(mainWindow);
    projectManager = new project_manager_1.ProjectManager();
    scriptGenerator = new script_generator_1.ScriptGenerator();
    pluginManager = new plugin_interface_1.PluginManager();
    /* Register built-in plugins */
    pluginManager.register(new plugin_interface_1.ConsoleLogPlugin());
    /* Register all IPC handlers */
    (0, handlers_1.registerIpcHandlers)(mainWindow, {
        recorder: recorderEngine,
        runner: runnerEngine,
        projectManager,
        scriptGenerator,
        browserManager,
    });
    /* Forward event bus logs to the renderer */
    event_bus_1.eventBus.on('log', (entry) => {
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
function createMenu() {
    const template = [
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
                    click: () => electron_1.shell.openExternal('https://playwright.dev'),
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
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
/* ------------------------------------------------------------------ */
/*  App Lifecycle                                                      */
/* ------------------------------------------------------------------ */
electron_1.app.whenReady().then(async () => {
    createMenu();
    await createMainWindow();
    initializeEngines();
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', async () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow();
        initializeEngines();
    }
});
electron_1.app.on('before-quit', () => {
    event_bus_1.eventBus.removeAllListeners();
});
//# sourceMappingURL=index.js.map