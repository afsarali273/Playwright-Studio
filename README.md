## Playwright IDE — Architecture Preview

This project is an architecture preview for a Playwright-based IDE. It contains:

- A **Next.js + React + TypeScript** web app that documents and visualizes the IDE architecture.
- An `src/` tree that sketches out a real **Electron + Playwright** IDE:
  - `src/main`: Electron main process, browser manager, recorder, runner, storage.
  - `src/shared`: Types, constants, and IPC contracts shared between main and renderer.
  - `src/renderer`: Planned renderer UI for the IDE window.

The web app is fully runnable today. The Electron runtime is scaffolded but not yet wired into the default npm scripts.

---

## Prerequisites

- Node.js **18+** recommended
- npm, pnpm, or yarn
- macOS, Linux, or Windows
- Optional (for Playwright work later): `npx playwright install` to download browser binaries

---

## Getting Started

From the project root:

```bash
npm install
# or
pnpm install
# or
yarn install
```

This installs all dependencies for the Next.js app and the TypeScript code under `src/`.

---

## Running the Web App (Architecture UI)

### Development

```bash
npm run dev
```

- Starts the Next.js development server (by default at `http://localhost:3000`).
- You will see the “Playwright IDE — Architecture Preview” interface with:
  - Architecture sections (recorder, runner, storage, browser manager, plugins).
  - Example steps and project configuration JSON.
  - Folder tree of the intended Electron + Playwright IDE.

### Production Build

```bash
npm run build
npm start
```

- `npm run build` creates an optimized production build.
- `npm start` serves the built Next.js app.

### Linting

```bash
npm run lint
```

This runs `eslint .` as defined in `package.json`. If `eslint` is not installed or configured yet, you may need to add it as a dev dependency and set up a config.

---

## Electron + Playwright IDE (Planned Wiring)

The repo includes a full `src/main` tree intended for an Electron main process and embedded Playwright browser:

- `src/main/core/browser-manager.ts`: Manages an `BrowserView` inside Electron and can discover external browsers via CDP.
- `src/main/recorder/recorder-engine.ts`: Orchestrator for recording steps (planned).
- `src/main/runner/runner-engine.ts`: Executes recorded steps using Playwright.
- `src/main/storage/project-manager.ts`: Handles project folders, config, and steps.
- `src/shared/types.ts`, `src/shared/ipc-channels.ts`, `src/shared/constants.ts`: Shared contracts between main and renderer.

In the architecture UI, you can see a suggested set of scripts for running the Electron build:

```json
{
  "scripts": {
    "dev:renderer": "vite --config vite.config.electron.ts",
    "dev:electron": "tsc -p src/tsconfig.electron.json && electron dist/main/index.js",
    "build:renderer": "vite build --config vite.config.electron.ts",
    "build:electron": "tsc -p src/tsconfig.electron.json",
    "build": "pnpm run build:renderer && pnpm run build:electron"
  }
}
```

These are not yet present in `package.json`. When you are ready to turn the architecture into a runnable Electron IDE, you can:

1. Add scripts like the ones above to `package.json`.
2. Configure `vite.config.electron.ts` to build the renderer for Electron.
3. Ensure `src/main/index.ts` and `src/tsconfig.electron.json` compile into `dist/main`.
4. Run:

   ```bash
   npx tsc -p src/tsconfig.electron.json
   npm run dev:renderer
   npm run dev:electron
   ```

---

## Project Layout

High-level structure:

- `app/`
  - Next.js routes and pages (including the architecture preview).
- `components/`
  - UI components used by the web app.
- `src/`
  - `main/`
    - Electron main process code (browser manager, recorder, runner, storage, IPC).
  - `renderer/`
    - Planned Electron renderer entry and UI.
  - `shared/`
    - Types, constants, and IPC channel definitions shared across processes.
- `examples/`
  - `config.json`: Sample project configuration.
  - `steps.json`: Sample recorded steps.

This layout is meant to reflect how a real Playwright IDE could be structured, even if not all parts are wired up yet.

---

## Type Checking

To run a TypeScript type check based on the root `tsconfig.json`:

```bash
npx tsc --noEmit
```

To type-check the Electron main process code using `src/tsconfig.electron.json` (once you have matching input files in `src/main` and `src/shared`):

```bash
npx tsc -p src/tsconfig.electron.json --noEmit
```

---

## Notes

- The current focus of this repository is **architecture and structure** rather than a fully polished IDE runtime.
- The Next.js app is the primary entry point for exploring the design.
- The Electron and Playwright pieces in `src/` are designed to be extended into a full local IDE if you choose to wire them up.

