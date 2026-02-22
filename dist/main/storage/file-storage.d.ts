/**
 * FileStorage - Low-level file system operations.
 * Provides async read/write for JSON and text files.
 */
export declare class FileStorage {
    /** Read a JSON file and parse it */
    readJson<T>(filePath: string): Promise<T>;
    /** Write an object as JSON to a file */
    writeJson<T>(filePath: string, data: T): Promise<void>;
    /** Read a text file */
    readText(filePath: string): Promise<string>;
    /** Write text to a file */
    writeText(filePath: string, content: string): Promise<void>;
    /** Check if a file or directory exists */
    exists(filePath: string): Promise<boolean>;
    /** Ensure a directory exists, creating it recursively if needed */
    ensureDir(dirPath: string): Promise<void>;
    /** List files in a directory */
    listFiles(dirPath: string, extension?: string): Promise<string[]>;
    /** Delete a file */
    deleteFile(filePath: string): Promise<void>;
}
//# sourceMappingURL=file-storage.d.ts.map