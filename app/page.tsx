import { IDEPreview } from "@/components/ide/ide-preview";
import {
  ArchitectureGrid,
  CodeSample,
  IPCDiagram,
  StepJsonSample,
  FeatureGrid,
  FolderTree,
} from "@/components/ide/architecture-sections";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  GitBranch,
  Terminal,
} from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      {/* Hero */}
      <header className="flex flex-col items-center gap-6 px-4 pt-16 pb-12 text-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#4f8cff]/15 text-[#4f8cff]">
            <Layers size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0e0] tracking-tight text-balance">
            Playwright IDE
          </h1>
        </div>
        <p className="max-w-2xl text-base md:text-lg text-[#a0a0c0] leading-relaxed text-pretty">
          A production-grade desktop test automation studio that combines the
          live-browser UI of Cypress with Katalon-style record/playback --
          powered by Playwright.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          {["Electron", "React", "TypeScript", "Zustand", "Playwright", "Monaco Editor"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full border border-[#2a2a4a] text-[#7a7a9a] bg-[#16213e] font-medium"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </header>

      {/* IDE Preview */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        <IDEPreview />
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* Features */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <SectionHeader
          title="Key Features"
          subtitle="Everything you need to record, play, debug, and export browser tests."
        />
        <FeatureGrid />
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* Architecture */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <SectionHeader
          title="Architecture"
          subtitle="Layered, event-driven modules that are isolated and independently testable."
        />
        <ArchitectureGrid />
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* IPC Communication */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <SectionHeader
          title="IPC Communication"
          subtitle="Typed channels between main process, renderer, and injected page scripts."
        />
        <IPCDiagram />
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* Step Model */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <SectionHeader
              title="Step Model"
              subtitle="Structured JSON, not raw code. Every action is stored as a typed, editable step."
            />
            <StepJsonSample />
          </div>
          <div>
            <SectionHeader
              title="Generated Output"
              subtitle="Export to clean, production-ready Playwright test scripts."
            />
            <CodeSample />
          </div>
        </div>
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* Folder Structure */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <SectionHeader
          title="Project Structure"
          subtitle="Clean architecture with isolated modules. Every layer has a single responsibility."
        />
        <FolderTree />
      </section>

      <Separator className="bg-[#2a2a4a] max-w-6xl mx-auto" />

      {/* Run Instructions */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <SectionHeader
          title="Getting Started"
          subtitle="Clone, install, and run the desktop IDE in development mode."
        />
        <div className="flex flex-col gap-4">
          <InstructionStep
            number={1}
            title="Clone and install dependencies"
            code={`git clone <repo-url> playwright-ide
cd playwright-ide
pnpm install`}
          />
          <InstructionStep
            number={2}
            title="Install Playwright browsers"
            code="npx playwright install chromium"
          />
          <InstructionStep
            number={3}
            title="Start the renderer dev server"
            code="pnpm run dev:renderer"
          />
          <InstructionStep
            number={4}
            title="Start the Electron main process"
            code="pnpm run dev:electron"
          />
          <InstructionStep
            number={5}
            title="Build for production"
            code="pnpm run build"
          />
        </div>

        <div className="mt-8 p-5 rounded-xl border border-[#2a2a4a] bg-[#16213e]">
          <h4 className="text-sm font-semibold text-[#e0e0e0] mb-3">
            Required package.json scripts
          </h4>
          <pre className="text-[11px] font-mono text-[#a0a0c0] leading-relaxed overflow-x-auto whitespace-pre">{`{
  "scripts": {
    "dev:renderer": "vite --config vite.config.electron.ts",
    "dev:electron": "tsc -p src/tsconfig.electron.json && electron dist/main/index.js",
    "build:renderer": "vite build --config vite.config.electron.ts",
    "build:electron": "tsc -p src/tsconfig.electron.json",
    "build": "pnpm run build:renderer && pnpm run build:electron"
  }
}`}</pre>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-6 px-4 py-8 border-t border-[#2a2a4a] text-xs text-[#7a7a9a]">
        <span className="flex items-center gap-1.5">
          <GitBranch size={12} />
          v0.1.0
        </span>
        <span className="flex items-center gap-1.5">
          <Terminal size={12} />
          TypeScript Everywhere
        </span>
        <span>Playwright IDE -- Architecture Preview</span>
      </footer>
    </div>
  );
}

/* ---- Helpers ---- */

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-[#e0e0e0] tracking-tight text-balance">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[#a0a0c0] leading-relaxed max-w-2xl text-pretty">
        {subtitle}
      </p>
    </div>
  );
}

function InstructionStep({
  number,
  title,
  code,
}: {
  number: number;
  title: string;
  code: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-[#2a2a4a] bg-[#16213e]">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#4f8cff]/15 text-[#4f8cff] text-xs font-bold flex-shrink-0 mt-0.5">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e0e0e0] mb-2">{title}</p>
        <pre className="text-[11px] font-mono text-[#00d4aa] bg-[#0d0d1a] p-2.5 rounded-lg overflow-x-auto whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}
