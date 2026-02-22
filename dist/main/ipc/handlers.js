"use strict";
/**
 * IPC Handlers - Registers all IPC handlers connecting the renderer to
 * the main process engines (recorder, runner, storage, generator).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const ipc_channels_1 = require("../../shared/ipc-channels");
/**
 * Register all IPC handlers. Call this once during app initialization.
 */
function registerIpcHandlers(mainWindow, engines) {
    const { recorder, runner, projectManager, scriptGenerator, browserManager } = engines;
    /* ---------------------------------------------------------------- */
    /*  Recorder                                                         */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RECORDER_START, async (_event, url) => {
        await recorder.start(url);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RECORDER_STOP, async () => {
        recorder.stop();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RECORDER_PAUSE, async () => {
        recorder.pause();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RECORDER_RESUME, async () => {
        recorder.resume();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RECORDER_ADD_ASSERTION, async (_event, payload) => {
        recorder.addAssertionStep(payload);
    });
    /* ---------------------------------------------------------------- */
    /*  Runner                                                           */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RUNNER_RUN_ALL, async () => {
        const steps = recorder.getSteps();
        await runner.runAll(steps);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RUNNER_RUN_FROM, async (_event, stepId) => {
        const steps = recorder.getSteps();
        await runner.runFrom(steps, stepId);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RUNNER_RUN_STEP, async (_event, stepId) => {
        const steps = recorder.getSteps();
        await runner.runStep(steps, stepId);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RUNNER_PAUSE, async () => {
        runner.pause();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.RUNNER_STOP, async () => {
        await runner.stop();
    });
    /* ---------------------------------------------------------------- */
    /*  Steps                                                            */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.STEP_GET_ALL, async () => {
        return recorder.getSteps();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.STEP_UPDATE, async (_event, step) => {
        recorder.updateStep(step);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.STEP_DELETE, async (_event, stepId) => {
        recorder.deleteStep(stepId);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.STEP_REORDER, async (_event, stepIds) => {
        recorder.reorderSteps(stepIds);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.STEP_CLEAR, async () => {
        recorder.clearSteps();
    });
    /* ---------------------------------------------------------------- */
    /*  Generator                                                        */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.GENERATOR_EXPORT, async () => {
        const steps = recorder.getSteps();
        const config = projectManager.getConfig();
        const script = scriptGenerator.generate(steps, config ?? undefined);
        /* Save to project if one is open */
        if (projectManager.getProjectPath()) {
            const filename = `test-${Date.now()}.spec.ts`;
            await projectManager.saveScript(filename, script);
        }
        return script;
    });
    /* ---------------------------------------------------------------- */
    /*  Project                                                          */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.PROJECT_NEW, async (_event, name) => {
        const projectPath = await projectManager.newProject(name);
        return projectPath;
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.PROJECT_OPEN, async () => {
        const projectPath = await projectManager.openProject();
        if (projectPath) {
            const steps = await projectManager.loadSteps();
            recorder.setSteps(steps);
        }
        return projectPath;
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.PROJECT_SAVE, async () => {
        const steps = recorder.getSteps();
        await projectManager.saveProject(steps);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.PROJECT_GET_CONFIG, async () => {
        return projectManager.getConfig();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.PROJECT_UPDATE_CONFIG, async (_event, partial) => {
        await projectManager.updateConfig(partial);
    });
    /* ---------------------------------------------------------------- */
    /*  Browser                                                          */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_NAVIGATE, async (_event, url) => {
        await browserManager.navigate(url);
    });
    electron_1.ipcMain.on(ipc_channels_1.IpcChannels.BROWSER_SET_BOUNDS, (_event, bounds) => {
        browserManager.setBounds(bounds);
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_BACK, async () => {
        await browserManager.goBack();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_FORWARD, async () => {
        await browserManager.goForward();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_RELOAD, async () => {
        await browserManager.reload();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_HIDE, () => {
        browserManager.hide();
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.BROWSER_SHOW, () => {
        browserManager.show();
    });
    /* ---------------------------------------------------------------- */
    /*  Inspector                                                        */
    /* ---------------------------------------------------------------- */
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.INSPECTOR_ENABLE, async () => {
        // Inject the script if it's not already there (auto-creates view if needed)
        // The executeScript method in BrowserManager now handles auto-creation and injection logic
        await browserManager.executeScript('window.__playwrightInspectorActive = true;');
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.INSPECTOR_DISABLE, async () => {
        await browserManager.executeScript('window.__playwrightInspectorActive = false;');
    });
    electron_1.ipcMain.handle(ipc_channels_1.IpcChannels.INSPECTOR_VALIDATE_LOCATOR, async (_event, locator) => {
        return browserManager.validateLocator(locator);
    });
    electron_1.ipcMain.on(ipc_channels_1.IpcChannels.INSPECTOR_EVENT_FROM_PAGE, (_event, payload) => {
        mainWindow.webContents.send(ipc_channels_1.IpcChannels.INSPECTOR_PICK, payload);
    });
}
//# sourceMappingURL=handlers.js.map