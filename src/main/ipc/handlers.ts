/**
 * IPC Handlers - Registers all IPC handlers connecting the renderer to
 * the main process engines (recorder, runner, storage, generator).
 */

import { ipcMain, BrowserWindow } from 'electron';
import { IpcChannels } from '../../shared/ipc-channels';
import { RecorderEngine } from '../recorder/recorder-engine';
import { RunnerEngine } from '../runner/runner-engine';
import { ProjectManager } from '../storage/project-manager';
import { ScriptGenerator, ScriptLanguage } from '../generator/script-generator';
import { BrowserManager } from '../core/browser-manager';
import type {
  TestStep,
  BrowserBounds,
  ProjectConfig,
  InspectorPayload,
} from '../../shared/types';

interface Engines {
  recorder: RecorderEngine;
  runner: RunnerEngine;
  projectManager: ProjectManager;
  scriptGenerator: ScriptGenerator;
  browserManager: BrowserManager;
}

/**
 * Register all IPC handlers. Call this once during app initialization.
 */
export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  engines: Engines,
): void {
  const { recorder, runner, projectManager, scriptGenerator, browserManager } = engines;

  /* ---------------------------------------------------------------- */
  /*  Recorder                                                         */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.RECORDER_START, async (_event, url?: string) => {
    await recorder.start(url);
  });

  ipcMain.handle(IpcChannels.RECORDER_STOP, async () => {
    recorder.stop();
  });

  ipcMain.handle(IpcChannels.RECORDER_PAUSE, async () => {
    recorder.pause();
  });

  ipcMain.handle(IpcChannels.RECORDER_RESUME, async () => {
    recorder.resume();
  });

  ipcMain.handle(IpcChannels.RECORDER_ADD_ASSERTION, async (_event, payload: any) => {
    recorder.addAssertionStep(payload);
  });

  /* ---------------------------------------------------------------- */
  /*  Runner                                                           */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.RUNNER_RUN_ALL, async () => {
    const steps = recorder.getSteps();
    await runner.runAll(steps);
  });

  ipcMain.handle(IpcChannels.RUNNER_RUN_FROM, async (_event, stepId: string) => {
    const steps = recorder.getSteps();
    await runner.runFrom(steps, stepId);
  });

  ipcMain.handle(IpcChannels.RUNNER_RUN_STEP, async (_event, stepId: string) => {
    const steps = recorder.getSteps();
    await runner.runStep(steps, stepId);
  });

  ipcMain.handle(IpcChannels.RUNNER_PAUSE, async () => {
    runner.pause();
  });

  ipcMain.handle(IpcChannels.RUNNER_STOP, async () => {
    await runner.stop();
  });

  /* ---------------------------------------------------------------- */
  /*  Steps                                                            */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.STEP_GET_ALL, async () => {
    return recorder.getSteps();
  });

  ipcMain.handle(IpcChannels.STEP_UPDATE, async (_event, step: TestStep) => {
    recorder.updateStep(step);
  });

  ipcMain.handle(IpcChannels.STEP_DELETE, async (_event, stepId: string) => {
    recorder.deleteStep(stepId);
  });

  ipcMain.handle(IpcChannels.STEP_REORDER, async (_event, stepIds: string[]) => {
    recorder.reorderSteps(stepIds);
  });

  ipcMain.handle(IpcChannels.STEP_CLEAR, async () => {
    recorder.clearSteps();
  });

  /* ---------------------------------------------------------------- */
  /*  Generator                                                        */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.GENERATOR_EXPORT, async (_event, language: ScriptLanguage = 'typescript') => {
    const steps = recorder.getSteps();
    const config = projectManager.getConfig();
    const script = scriptGenerator.generate(steps, config ?? undefined, language);

    /* Save to project if one is open */
    if (projectManager.getProjectPath()) {
      let ext = 'ts';
      if (language === 'java') {
        ext = 'java';
      } else if (language === 'cucumber') {
        ext = 'feature';
      }
      const filename = `test-${Date.now()}.${ext}`;
      await projectManager.saveScript(filename, script);
    }

    return script;
  });

  /* ---------------------------------------------------------------- */
  /*  Project                                                          */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.PROJECT_NEW, async (_event, name: string) => {
    const projectPath = await projectManager.newProject(name);
    return projectPath;
  });

  ipcMain.handle(IpcChannels.PROJECT_OPEN, async () => {
    const projectPath = await projectManager.openProject();
    if (projectPath) {
      const steps = await projectManager.loadSteps();
      recorder.setSteps(steps);
    }
    return projectPath;
  });

  ipcMain.handle(IpcChannels.PROJECT_SAVE, async () => {
    const steps = recorder.getSteps();
    await projectManager.saveProject(steps);
  });

  ipcMain.handle(IpcChannels.PROJECT_GET_CONFIG, async () => {
    return projectManager.getConfig();
  });

  ipcMain.handle(
    IpcChannels.PROJECT_UPDATE_CONFIG,
    async (_event, partial: Partial<ProjectConfig>) => {
      await projectManager.updateConfig(partial);
    },
  );

  /* ---------------------------------------------------------------- */
  /*  Browser                                                          */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.BROWSER_NAVIGATE, async (_event, url: string) => {
    await browserManager.navigate(url);
  });

  ipcMain.on(IpcChannels.BROWSER_SET_BOUNDS, (_event, bounds: BrowserBounds) => {
    browserManager.setBounds(bounds);
  });

  ipcMain.handle(IpcChannels.BROWSER_BACK, async () => {
    await browserManager.goBack();
  });

  ipcMain.handle(IpcChannels.BROWSER_FORWARD, async () => {
    await browserManager.goForward();
  });

  ipcMain.handle(IpcChannels.BROWSER_RELOAD, async () => {
    await browserManager.reload();
  });

  ipcMain.handle(IpcChannels.BROWSER_HIDE, () => {
    browserManager.hide();
  });

  ipcMain.handle(IpcChannels.BROWSER_SHOW, () => {
    browserManager.show();
  });

  /* ---------------------------------------------------------------- */
  /*  Inspector                                                        */
  /* ---------------------------------------------------------------- */

  ipcMain.handle(IpcChannels.INSPECTOR_ENABLE, async () => {
    // Inject the script if it's not already there (auto-creates view if needed)
    // The executeScript method in BrowserManager now handles auto-creation and injection logic
    await browserManager.executeScript(
      'window.__playwrightInspectorActive = true;',
    );
  });

  ipcMain.handle(IpcChannels.INSPECTOR_DISABLE, async () => {
    await browserManager.executeScript(
      'window.__playwrightInspectorActive = false;',
    );
  });

  ipcMain.handle(IpcChannels.INSPECTOR_VALIDATE_LOCATOR, async (_event, locator: string) => {
    return browserManager.validateLocator(locator);
  });

  ipcMain.on(
    IpcChannels.INSPECTOR_EVENT_FROM_PAGE,
    (_event, payload: InspectorPayload) => {
      // Broadcast to all windows (main window and recording panel)
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.webContents.send(IpcChannels.INSPECTOR_PICK, payload);
        }
      });
    },
  );
}
