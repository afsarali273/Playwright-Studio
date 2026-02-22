"use strict";
/**
 * FileStorage - Low-level file system operations.
 * Provides async read/write for JSON and text files.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorage = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class FileStorage {
    /** Read a JSON file and parse it */
    async readJson(filePath) {
        const content = await promises_1.default.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    /** Write an object as JSON to a file */
    async writeJson(filePath, data) {
        await this.ensureDir(path_1.default.dirname(filePath));
        const content = JSON.stringify(data, null, 2);
        await promises_1.default.writeFile(filePath, content, 'utf-8');
    }
    /** Read a text file */
    async readText(filePath) {
        return promises_1.default.readFile(filePath, 'utf-8');
    }
    /** Write text to a file */
    async writeText(filePath, content) {
        await this.ensureDir(path_1.default.dirname(filePath));
        await promises_1.default.writeFile(filePath, content, 'utf-8');
    }
    /** Check if a file or directory exists */
    async exists(filePath) {
        try {
            await promises_1.default.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /** Ensure a directory exists, creating it recursively if needed */
    async ensureDir(dirPath) {
        await promises_1.default.mkdir(dirPath, { recursive: true });
    }
    /** List files in a directory */
    async listFiles(dirPath, extension) {
        try {
            const entries = await promises_1.default.readdir(dirPath, { withFileTypes: true });
            let files = entries
                .filter((e) => e.isFile())
                .map((e) => path_1.default.join(dirPath, e.name));
            if (extension) {
                files = files.filter((f) => f.endsWith(extension));
            }
            return files;
        }
        catch {
            return [];
        }
    }
    /** Delete a file */
    async deleteFile(filePath) {
        await promises_1.default.unlink(filePath);
    }
}
exports.FileStorage = FileStorage;
//# sourceMappingURL=file-storage.js.map