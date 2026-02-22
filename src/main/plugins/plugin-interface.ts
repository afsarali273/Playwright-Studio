/**
 * Plugin Interface - Extensible plugin system for the IDE.
 * Plugins can hook into recording, running, and export lifecycle events.
 */

import type { IPlugin, PluginManifest, PluginHook, PluginContext } from '../../shared/types';
import { eventBus } from '../core/event-bus';

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();

  /** Register a plugin */
  async register(plugin: IPlugin): Promise<void> {
    const { name } = plugin.manifest;

    if (this.plugins.has(name)) {
      throw new Error(`Plugin "${name}" is already registered`);
    }

    this.plugins.set(name, plugin);
    console.log(`[PluginManager] Registered plugin: ${name}`);
  }

  /** Activate a plugin */
  async activate(name: string, context: PluginContext): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) throw new Error(`Plugin "${name}" not found`);

    await plugin.activate(context);
    console.log(`[PluginManager] Activated plugin: ${name}`);
  }

  /** Deactivate a plugin */
  async deactivate(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) throw new Error(`Plugin "${name}" not found`);

    await plugin.deactivate();
    console.log(`[PluginManager] Deactivated plugin: ${name}`);
  }

  /** Unregister a plugin */
  unregister(name: string): void {
    this.plugins.delete(name);
  }

  /** Run a hook across all registered plugins */
  async runHook(hook: PluginHook, context: PluginContext): Promise<PluginContext> {
    let currentContext = context;

    for (const [name, plugin] of this.plugins) {
      if (plugin.manifest.hooks.includes(hook)) {
        try {
          currentContext = await plugin.onHook(hook, currentContext);
        } catch (err) {
          console.error(`[PluginManager] Error in plugin "${name}" hook "${hook}":`, err);
        }
      }
    }

    return currentContext;
  }

  /** Get all registered plugin manifests */
  getManifests(): PluginManifest[] {
    return Array.from(this.plugins.values()).map((p) => p.manifest);
  }

  /** Get a specific plugin */
  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name);
  }
}

/* ------------------------------------------------------------------ */
/*  Example Plugin (for reference / testing)                           */
/* ------------------------------------------------------------------ */

export class ConsoleLogPlugin implements IPlugin {
  manifest: PluginManifest = {
    name: 'console-logger',
    version: '1.0.0',
    description: 'Logs all hook events to the console',
    author: 'Playwright IDE',
    hooks: ['beforeRecord', 'afterRecord', 'beforeRun', 'afterRun', 'beforeStep', 'afterStep', 'onExport'],
  };

  async activate(_context: PluginContext): Promise<void> {
    console.log('[ConsoleLogPlugin] Activated');
  }

  async deactivate(): Promise<void> {
    console.log('[ConsoleLogPlugin] Deactivated');
  }

  async onHook(hook: PluginHook, context: PluginContext): Promise<PluginContext> {
    console.log(`[ConsoleLogPlugin] Hook: ${hook}`, {
      stepCount: context.steps.length,
      currentStep: context.currentStep?.id,
    });
    return context;
  }
}
