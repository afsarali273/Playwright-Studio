/**
 * FileStorage - Low-level file system operations.
 * Provides async read/write for JSON and text files.
 */

import fs from 'fs/promises';
import path from 'path';

export class FileStorage {
  /** Read a JSON file and parse it */
  async readJson<T>(filePath: string): Promise<T> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /** Write an object as JSON to a file */
  async writeJson<T>(filePath: string, data: T): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /** Read a text file */
  async readText(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  /** Write text to a file */
  async writeText(filePath: string, content: string): Promise<void> {
    await this.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  /** Check if a file or directory exists */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /** Ensure a directory exists, creating it recursively if needed */
  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  /** List files in a directory */
  async listFiles(dirPath: string, extension?: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      let files = entries
        .filter((e) => e.isFile())
        .map((e) => path.join(dirPath, e.name));

      if (extension) {
        files = files.filter((f) => f.endsWith(extension));
      }

      return files;
    } catch {
      return [];
    }
  }

  /** Delete a file */
  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }
}
