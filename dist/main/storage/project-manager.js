"use strict";
/**
 * ProjectManager - Manages project directories, config, and step files.
 * Handles new/open/save operations for the project structure:
 *
 * project/
 *   config.json
 *   tests/
 *     steps.json
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectManager = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const file_storage_1 = require("./file-storage");
const constants_1 = require("../../shared/constants");
class ProjectManager {
    storage = new file_storage_1.FileStorage();
    projectPath = null;
    config = null;
    /** Get the current project path */
    getProjectPath() {
        return this.projectPath;
    }
    /** Get the current project config */
    getConfig() {
        return this.config;
    }
    /* ---------------------------------------------------------------- */
    /*  Project CRUD                                                     */
    /* ---------------------------------------------------------------- */
    /** Create a new project in the default directory */
    async newProject(name) {
        const baseDir = path_1.default.join(electron_1.app.getPath('documents'), 'PlaywrightIDE');
        const projectDir = path_1.default.join(baseDir, name);
        await this.storage.ensureDir(projectDir);
        await this.storage.ensureDir(path_1.default.join(projectDir, 'tests'));
        await this.storage.ensureDir(path_1.default.join(projectDir, 'screenshots'));
        const now = new Date().toISOString();
        const config = {
            ...constants_1.DEFAULT_PROJECT_CONFIG,
            name,
            createdAt: now,
            updatedAt: now,
        };
        await this.storage.writeJson(path_1.default.join(projectDir, 'config.json'), config);
        await this.storage.writeJson(path_1.default.join(projectDir, 'tests', 'steps.json'), []);
        this.projectPath = projectDir;
        this.config = config;
        return projectDir;
    }
    /** Open an existing project via dialog */
    async openProject() {
        const result = await electron_1.dialog.showOpenDialog({
            title: 'Open Project',
            properties: ['openDirectory'],
            defaultPath: path_1.default.join(electron_1.app.getPath('documents'), 'PlaywrightIDE'),
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        const projectDir = result.filePaths[0];
        return this.loadProject(projectDir);
    }
    /** Load project from a given path */
    async loadProject(projectDir) {
        const configPath = path_1.default.join(projectDir, 'config.json');
        const exists = await this.storage.exists(configPath);
        if (!exists) {
            throw new Error('Not a valid Playwright IDE project: config.json not found');
        }
        this.config = await this.storage.readJson(configPath);
        this.projectPath = projectDir;
        return projectDir;
    }
    /** Save steps and config to the current project */
    async saveProject(steps) {
        if (!this.projectPath || !this.config) {
            throw new Error('No project open');
        }
        this.config.updatedAt = new Date().toISOString();
        await this.storage.writeJson(path_1.default.join(this.projectPath, 'config.json'), this.config);
        await this.storage.writeJson(path_1.default.join(this.projectPath, 'tests', 'steps.json'), steps);
    }
    /** Update partial config */
    async updateConfig(partial) {
        if (!this.config || !this.projectPath) {
            throw new Error('No project open');
        }
        this.config = { ...this.config, ...partial, updatedAt: new Date().toISOString() };
        await this.storage.writeJson(path_1.default.join(this.projectPath, 'config.json'), this.config);
    }
    /* ---------------------------------------------------------------- */
    /*  Step persistence                                                 */
    /* ---------------------------------------------------------------- */
    /** Load steps from the current project */
    async loadSteps() {
        if (!this.projectPath)
            return [];
        const stepsPath = path_1.default.join(this.projectPath, 'tests', 'steps.json');
        const exists = await this.storage.exists(stepsPath);
        if (!exists)
            return [];
        return this.storage.readJson(stepsPath);
    }
    /** Save a generated test script */
    async saveScript(filename, content) {
        if (!this.projectPath) {
            throw new Error('No project open');
        }
        const filePath = path_1.default.join(this.projectPath, 'tests', filename);
        await this.storage.writeText(filePath, content);
        return filePath;
    }
    /** Get the full project data */
    async getProjectData() {
        if (!this.config)
            return null;
        const steps = await this.loadSteps();
        return { config: this.config, steps };
    }
}
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=project-manager.js.map