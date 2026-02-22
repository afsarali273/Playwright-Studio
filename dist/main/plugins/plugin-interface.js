"use strict";
/**
 * Plugin Interface - Extensible plugin system for the IDE.
 * Plugins can hook into recording, running, and export lifecycle events.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLogPlugin = exports.PluginManager = void 0;
class PluginManager {
    plugins = new Map();
    /** Register a plugin */
    async register(plugin) {
        const { name } = plugin.manifest;
        if (this.plugins.has(name)) {
            throw new Error(`Plugin "${name}" is already registered`);
        }
        this.plugins.set(name, plugin);
        console.log(`[PluginManager] Registered plugin: ${name}`);
    }
    /** Activate a plugin */
    async activate(name, context) {
        const plugin = this.plugins.get(name);
        if (!plugin)
            throw new Error(`Plugin "${name}" not found`);
        await plugin.activate(context);
        console.log(`[PluginManager] Activated plugin: ${name}`);
    }
    /** Deactivate a plugin */
    async deactivate(name) {
        const plugin = this.plugins.get(name);
        if (!plugin)
            throw new Error(`Plugin "${name}" not found`);
        await plugin.deactivate();
        console.log(`[PluginManager] Deactivated plugin: ${name}`);
    }
    /** Unregister a plugin */
    unregister(name) {
        this.plugins.delete(name);
    }
    /** Run a hook across all registered plugins */
    async runHook(hook, context) {
        let currentContext = context;
        for (const [name, plugin] of this.plugins) {
            if (plugin.manifest.hooks.includes(hook)) {
                try {
                    currentContext = await plugin.onHook(hook, currentContext);
                }
                catch (err) {
                    console.error(`[PluginManager] Error in plugin "${name}" hook "${hook}":`, err);
                }
            }
        }
        return currentContext;
    }
    /** Get all registered plugin manifests */
    getManifests() {
        return Array.from(this.plugins.values()).map((p) => p.manifest);
    }
    /** Get a specific plugin */
    getPlugin(name) {
        return this.plugins.get(name);
    }
}
exports.PluginManager = PluginManager;
/* ------------------------------------------------------------------ */
/*  Example Plugin (for reference / testing)                           */
/* ------------------------------------------------------------------ */
class ConsoleLogPlugin {
    manifest = {
        name: 'console-logger',
        version: '1.0.0',
        description: 'Logs all hook events to the console',
        author: 'Playwright IDE',
        hooks: ['beforeRecord', 'afterRecord', 'beforeRun', 'afterRun', 'beforeStep', 'afterStep', 'onExport'],
    };
    async activate(_context) {
        console.log('[ConsoleLogPlugin] Activated');
    }
    async deactivate() {
        console.log('[ConsoleLogPlugin] Deactivated');
    }
    async onHook(hook, context) {
        console.log(`[ConsoleLogPlugin] Hook: ${hook}`, {
            stepCount: context.steps.length,
            currentStep: context.currentStep?.id,
        });
        return context;
    }
}
exports.ConsoleLogPlugin = ConsoleLogPlugin;
//# sourceMappingURL=plugin-interface.js.map