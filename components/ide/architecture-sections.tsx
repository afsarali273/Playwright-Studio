import React from "react";
import {
  Layers,
  Radio,
  Play,
  Code2,
  HardDrive,
  Plug,
  MonitorSmartphone,
  Braces,
  MousePointerClick,
  FileCode,
} from "lucide-react";

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  description: string;
  files: string[];
}

function ModuleCard({ icon, title, path, description, files }: ModuleCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-[#2a2a4a] bg-[#16213e] hover:border-[#4f8cff]/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#4f8cff]/10 text-[#4f8cff]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#e0e0e0]">{title}</h3>
          <p className="text-[11px] font-mono text-[#7a7a9a]">{path}</p>
        </div>
      </div>
      <p className="text-xs text-[#a0a0c0] leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-1.5">
        {files.map((f) => (
          <span
            key={f}
            className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#1a1a2e] text-[#7a7a9a] border border-[#2a2a4a]"
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

const MODULES: ModuleCardProps[] = [
  {
    icon: <Layers size={18} />,
    title: "Core",
    path: "src/main/core/",
    description:
      "Event bus for decoupled module communication and browser lifecycle manager using Playwright's Chromium CDP connection.",
    files: ["event-bus.ts", "browser-manager.ts"],
  },
  {
    icon: <Radio size={18} />,
    title: "Recorder",
    path: "src/main/recorder/",
    description:
      "Injects a DOM listener script into pages to capture clicks, inputs, navigation, and keyboard events. Includes smart selector generation with data-testid priority.",
    files: ["recorder-engine.ts", "inject-script.ts"],
  },
  {
    icon: <Play size={18} />,
    title: "Runner",
    path: "src/main/runner/",
    description:
      "Executes test steps against the live Playwright page. Supports run-all, run-from, and run-single modes with pause/stop controls.",
    files: ["runner-engine.ts", "action-mapper.ts"],
  },
  {
    icon: <HardDrive size={18} />,
    title: "Storage",
    path: "src/main/storage/",
    description:
      "JSON file-based persistence for test projects. Manages steps.json and config.json with CRUD operations and project lifecycle.",
    files: ["file-storage.ts", "project-manager.ts"],
  },
  {
    icon: <Code2 size={18} />,
    title: "Generator",
    path: "src/main/generator/",
    description:
      "Converts structured JSON steps into valid Playwright test scripts. Maps each action type to its corresponding Playwright API call.",
    files: ["script-generator.ts"],
  },
  {
    icon: <Plug size={18} />,
    title: "Plugins",
    path: "src/main/plugins/",
    description:
      "Extensible hook-based plugin system. Plugins can tap into beforeRecord, afterRun, onExport, and other lifecycle events.",
    files: ["plugin-interface.ts"],
  },
  {
    icon: <MonitorSmartphone size={18} />,
    title: "Renderer UI",
    path: "src/renderer/",
    description:
      "React + TypeScript UI with Zustand state management. Four-panel layout: step list, browser viewport, log panel, and toolbar.",
    files: ["App.tsx", "Toolbar.tsx", "StepList.tsx", "BrowserPanel.tsx", "LogPanel.tsx"],
  },
  {
    icon: <Braces size={18} />,
    title: "Shared Types",
    path: "src/shared/",
    description:
      "TypeScript type definitions shared between main and renderer processes. Defines IPC channel contracts, step models, and event payloads.",
    files: ["types.ts", "ipc-channels.ts", "constants.ts"],
  },
];

export function ArchitectureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {MODULES.map((mod) => (
        <ModuleCard key={mod.title} {...mod} />
      ))}
    </div>
  );
}

/* ---- Exported Code Sample ---- */
export function CodeSample() {
  const code = `test('generated test', async ({ page }) => {
  // Step 1: Navigate to page
  await page.goto('https://example.com/login');

  // Step 2: Click on login button
  await page.click('[data-testid="login-button"]');

  // Step 3: Type username
  await page.fill('[data-testid="username-input"]', 'testuser');

  // Step 4: Type password
  await page.fill('[data-testid="password-input"]', 'password123');

  // Step 5: Click submit
  await page.click('[data-testid="submit-button"]');

  // Step 6: Wait for navigation
  await page.waitForURL('**/dashboard');
});`;

  return (
    <pre className="p-5 rounded-xl border border-[#2a2a4a] bg-[#0d0d1a] text-[12px] font-mono leading-relaxed text-[#e0e0e0] overflow-x-auto">
      <code>{code}</code>
    </pre>
  );
}

/* ---- IPC Diagram ---- */
export function IPCDiagram() {
  const diagram = `
  +--------------------+         IPC Channels          +--------------------+
  |                    |                                |                    |
  |   MAIN PROCESS     | <----- recorder:event -------- |   INJECTED PAGE    |
  |                    | -----  step:added -----------> |                    |
  |   - EventBus       |                                +--------------------+
  |   - RecorderEngine |
  |   - RunnerEngine   | <----- runner:run-all -------- +--------------------+
  |   - BrowserManager | ----- runner:step-update ----> |                    |
  |   - Storage        | ----- runner:status ---------> |   RENDERER (React) |
  |   - Generator      | ----- log:event -------------> |                    |
  |   - PluginManager  | <----- generator:export ------- |   - Zustand Stores |
  |                    | ----- generator:result ------> |   - UI Components  |
  +--------------------+                                +--------------------+
`;

  return (
    <pre className="p-5 rounded-xl border border-[#2a2a4a] bg-[#0d0d1a] text-[11px] font-mono leading-relaxed text-[#a0a0c0] overflow-x-auto whitespace-pre">
      {diagram}
    </pre>
  );
}

/* ---- Step JSON Sample ---- */
export function StepJsonSample() {
  const json = `{
  "id": "step-003",
  "action": "input",
  "selector": "[data-testid=\\"username-input\\"]",
  "value": "testuser",
  "description": "Type username",
  "timestamp": 1708300002000,
  "status": "idle",
  "meta": {
    "tagName": "INPUT",
    "selectorStrategy": "data-testid",
    "confidence": 0.95
  }
}`;

  return (
    <pre className="p-5 rounded-xl border border-[#2a2a4a] bg-[#0d0d1a] text-[12px] font-mono leading-relaxed text-[#e0e0e0] overflow-x-auto">
      <code>{json}</code>
    </pre>
  );
}

/* ---- Feature List ---- */
interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: <MonitorSmartphone size={20} />,
    title: "Embedded Live Browser",
    description: "Real Chromium instance embedded via Playwright CDP connection. See your app exactly as users do.",
  },
  {
    icon: <Radio size={20} />,
    title: "Smart Recording",
    description: "Inject script captures clicks, inputs, navigation. Smart selector generator prioritizes data-testid > id > aria-label.",
  },
  {
    icon: <Play size={20} />,
    title: "Flexible Playback",
    description: "Run all steps, run from a selected step, or execute a single step. Pause and stop at any time.",
  },
  {
    icon: <FileCode size={20} />,
    title: "Script Generation",
    description: "Export recorded steps as production-ready Playwright test files. Clean, readable, and maintainable.",
  },
  {
    icon: <MousePointerClick size={20} />,
    title: "Visual Debugging",
    description: "Live step highlighting, status indicators, real-time logs, and error details for each step execution.",
  },
  {
    icon: <Plug size={20} />,
    title: "Plugin System",
    description: "Hook-based plugin architecture for extensibility. Tap into recording, running, and export lifecycle events.",
  },
];

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((feat) => (
        <div
          key={feat.title}
          className="flex flex-col gap-3 p-5 rounded-xl border border-[#2a2a4a] bg-[#16213e] hover:border-[#00d4aa]/40 transition-colors"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa]">
            {feat.icon}
          </div>
          <h3 className="text-sm font-semibold text-[#e0e0e0]">
            {feat.title}
          </h3>
          <p className="text-xs text-[#a0a0c0] leading-relaxed">
            {feat.description}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---- Folder Tree ---- */
export function FolderTree() {
  const tree = `playwright-ide/
  src/
    shared/
      types.ts              # Shared TypeScript types (TestStep, RunnerStatus, etc.)
      ipc-channels.ts       # Typed IPC channel definitions
      constants.ts          # App-wide constants and defaults
    main/
      index.ts              # Electron main process entry point
      preload-main.ts       # Preload script for renderer window
      preload-browser.ts    # Preload script for embedded browser
      core/
        event-bus.ts        # Typed EventEmitter for internal communication
        browser-manager.ts  # Playwright Chromium lifecycle + CDP bridge
      recorder/
        recorder-engine.ts  # Recording orchestrator + event processing
        inject-script.ts    # DOM listener injected into target pages
      runner/
        runner-engine.ts    # Step execution engine (runAll/runFrom/runStep)
        action-mapper.ts    # Maps step actions to Playwright API calls
      storage/
        file-storage.ts     # Low-level JSON file read/write
        project-manager.ts  # Project CRUD (steps, config, tests/)
      generator/
        script-generator.ts # Converts steps JSON to Playwright .spec.ts
      plugins/
        plugin-interface.ts # Plugin system: manifest, hooks, lifecycle
      ipc/
        handlers.ts         # IPC handler registration for all channels
    renderer/
      index.tsx             # React entry point
      index.html            # HTML template
      styles/
        app.css             # Complete IDE stylesheet (dark theme)
      types/
        electron.d.ts       # Window.electronAPI type declaration
      stores/
        steps-store.ts      # Zustand: test step CRUD + selection
        recorder-store.ts   # Zustand: recording state
        runner-store.ts     # Zustand: execution status + progress
        logs-store.ts       # Zustand: rolling log buffer
        ui-store.ts         # Zustand: layout + modal + URL state
      hooks/
        use-ipc-listeners.ts # Hook subscribing to all IPC events
      components/
        App.tsx             # Root shell (4-panel layout)
        Toolbar.tsx         # Top bar: record/run/export + URL nav
        StepList.tsx        # Left panel: step rows with status
        BrowserPanel.tsx    # Center: browser viewport container
        LogPanel.tsx        # Right: real-time log viewer
        ExportModal.tsx     # Modal: generated script preview
        StatusBar.tsx       # Bottom: runner progress + stats
  examples/
    steps.json              # Example recorded steps
    config.json             # Example project config
    generated-test.spec.ts  # Example export output`;

  return (
    <pre className="p-5 rounded-xl border border-[#2a2a4a] bg-[#0d0d1a] text-[11px] font-mono leading-relaxed text-[#a0a0c0] overflow-x-auto whitespace-pre">
      {tree}
    </pre>
  );
}
