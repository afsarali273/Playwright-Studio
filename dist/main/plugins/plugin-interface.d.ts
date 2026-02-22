/**
 * Plugin Interface - Extensible plugin system for the IDE.
 * Plugins can hook into recording, running, and export lifecycle events.
 */
import type { IPlugin, PluginManifest, PluginHook, PluginContext } from '../../shared/types';
export declare class PluginManager {
    private plugins;
    /** Register a plugin */
    register(plugin: IPlugin): Promise<void>;
    /** Activate a plugin */
    activate(name: string, context: PluginContext): Promise<void>;
    /** Deactivate a plugin */
    deactivate(name: string): Promise<void>;
    /** Unregister a plugin */
    unregister(name: string): void;
    /** Run a hook across all registered plugins */
    runHook(hook: PluginHook, context: PluginContext): Promise<PluginContext>;
    /** Get all registered plugin manifests */
    getManifests(): PluginManifest[];
    /** Get a specific plugin */
    getPlugin(name: string): IPlugin | undefined;
}
export declare class ConsoleLogPlugin implements IPlugin {
    manifest: PluginManifest;
    activate(_context: PluginContext): Promise<void>;
    deactivate(): Promise<void>;
    onHook(hook: PluginHook, context: PluginContext): Promise<PluginContext>;
}
//# sourceMappingURL=plugin-interface.d.ts.map