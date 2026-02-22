/**
 * ProjectManager - Manages project directories, config, and step files.
 * Handles new/open/save operations for the project structure:
 *
 * project/
 *   config.json
 *   tests/
 *     steps.json
 */
import type { ProjectConfig, TestStep, ProjectData } from '../../shared/types';
export declare class ProjectManager {
    private storage;
    private projectPath;
    private config;
    /** Get the current project path */
    getProjectPath(): string | null;
    /** Get the current project config */
    getConfig(): ProjectConfig | null;
    /** Create a new project in the default directory */
    newProject(name: string): Promise<string>;
    /** Open an existing project via dialog */
    openProject(): Promise<string | null>;
    /** Load project from a given path */
    loadProject(projectDir: string): Promise<string | null>;
    /** Save steps and config to the current project */
    saveProject(steps: TestStep[]): Promise<void>;
    /** Update partial config */
    updateConfig(partial: Partial<ProjectConfig>): Promise<void>;
    /** Load steps from the current project */
    loadSteps(): Promise<TestStep[]>;
    /** Save a generated test script */
    saveScript(filename: string, content: string): Promise<string>;
    /** Get the full project data */
    getProjectData(): Promise<ProjectData | null>;
}
//# sourceMappingURL=project-manager.d.ts.map