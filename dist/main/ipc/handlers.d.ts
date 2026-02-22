/**
 * IPC Handlers - Registers all IPC handlers connecting the renderer to
 * the main process engines (recorder, runner, storage, generator).
 */
import { BrowserWindow } from 'electron';
import { RecorderEngine } from '../recorder/recorder-engine';
import { RunnerEngine } from '../runner/runner-engine';
import { ProjectManager } from '../storage/project-manager';
import { ScriptGenerator } from '../generator/script-generator';
import { BrowserManager } from '../core/browser-manager';
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
export declare function registerIpcHandlers(mainWindow: BrowserWindow, engines: Engines): void;
export {};
//# sourceMappingURL=handlers.d.ts.map