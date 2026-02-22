/**
 * ProjectManager - Manages project directories, config, and step files.
 * Handles new/open/save operations for the project structure:
 *
 * project/
 *   config.json
 *   tests/
 *     steps.json
 */

import path from 'path';
import { app, dialog } from 'electron';
import { FileStorage } from './file-storage';
import { DEFAULT_PROJECT_CONFIG } from '../../shared/constants';
import type { ProjectConfig, TestStep, ProjectData } from '../../shared/types';

export class ProjectManager {
  private storage = new FileStorage();
  private projectPath: string | null = null;
  private config: ProjectConfig | null = null;

  /** Get the current project path */
  getProjectPath(): string | null {
    return this.projectPath;
  }

  /** Get the current project config */
  getConfig(): ProjectConfig | null {
    return this.config;
  }

  /* ---------------------------------------------------------------- */
  /*  Project CRUD                                                     */
  /* ---------------------------------------------------------------- */

  /** Create a new project in the default directory */
  async newProject(name: string): Promise<string> {
    const baseDir = path.join(app.getPath('documents'), 'PlaywrightIDE');
    const projectDir = path.join(baseDir, name);

    await this.storage.ensureDir(projectDir);
    await this.storage.ensureDir(path.join(projectDir, 'tests'));
    await this.storage.ensureDir(path.join(projectDir, 'screenshots'));

    const now = new Date().toISOString();
    const config: ProjectConfig = {
      ...DEFAULT_PROJECT_CONFIG,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await this.storage.writeJson(path.join(projectDir, 'config.json'), config);
    await this.storage.writeJson(path.join(projectDir, 'tests', 'steps.json'), []);

    this.projectPath = projectDir;
    this.config = config;

    return projectDir;
  }

  /** Open an existing project via dialog */
  async openProject(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
      title: 'Open Project',
      properties: ['openDirectory'],
      defaultPath: path.join(app.getPath('documents'), 'PlaywrightIDE'),
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const projectDir = result.filePaths[0];
    return this.loadProject(projectDir);
  }

  /** Load project from a given path */
  async loadProject(projectDir: string): Promise<string | null> {
    const configPath = path.join(projectDir, 'config.json');
    const exists = await this.storage.exists(configPath);

    if (!exists) {
      throw new Error('Not a valid Playwright IDE project: config.json not found');
    }

    this.config = await this.storage.readJson<ProjectConfig>(configPath);
    this.projectPath = projectDir;
    return projectDir;
  }

  /** Save steps and config to the current project */
  async saveProject(steps: TestStep[]): Promise<void> {
    if (!this.projectPath || !this.config) {
      throw new Error('No project open');
    }

    this.config.updatedAt = new Date().toISOString();

    await this.storage.writeJson(
      path.join(this.projectPath, 'config.json'),
      this.config,
    );
    await this.storage.writeJson(
      path.join(this.projectPath, 'tests', 'steps.json'),
      steps,
    );
  }

  /** Update partial config */
  async updateConfig(partial: Partial<ProjectConfig>): Promise<void> {
    if (!this.config || !this.projectPath) {
      throw new Error('No project open');
    }

    this.config = { ...this.config, ...partial, updatedAt: new Date().toISOString() };

    await this.storage.writeJson(
      path.join(this.projectPath, 'config.json'),
      this.config,
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Step persistence                                                 */
  /* ---------------------------------------------------------------- */

  /** Load steps from the current project */
  async loadSteps(): Promise<TestStep[]> {
    if (!this.projectPath) return [];

    const stepsPath = path.join(this.projectPath, 'tests', 'steps.json');
    const exists = await this.storage.exists(stepsPath);

    if (!exists) return [];

    return this.storage.readJson<TestStep[]>(stepsPath);
  }

  /** Save a generated test script */
  async saveScript(filename: string, content: string): Promise<string> {
    if (!this.projectPath) {
      throw new Error('No project open');
    }

    const filePath = path.join(this.projectPath, 'tests', filename);
    await this.storage.writeText(filePath, content);
    return filePath;
  }

  /** Get the full project data */
  async getProjectData(): Promise<ProjectData | null> {
    if (!this.config) return null;

    const steps = await this.loadSteps();
    return { config: this.config, steps };
  }
}
