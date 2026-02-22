<img src="assets/icon-master.png" width="96" align="right" alt="Playwright Studio Icon" />

# Playwright Studio

> A codeless, cross-platform desktop application for recording, running and exporting Playwright tests — with built-in support for **TypeScript**, **Java** and **Cucumber Gherkin** output.

[![Release](https://img.shields.io/github/v/release/afsarali273/Playwright-Studio?style=flat-square)](https://github.com/afsarali273/Playwright-Studio/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/afsarali273/Playwright-Studio/ci.yml?label=CI&style=flat-square)](https://github.com/afsarali273/Playwright-Studio/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-40-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.58-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)

---

## 📥 Download

Download the latest pre-built installer for your platform from the [Releases](https://github.com/afsarali273/Playwright-Studio/releases) page.

| Platform | Architecture | File |
|----------|-------------|------|
| 🍎 macOS | Apple Silicon (M1/M2/M3/M4) | `Playwright-Studio-*-arm64.dmg` |
| 🍎 macOS | Intel | `Playwright-Studio-*-x64.dmg` |
| 🪟 Windows | 64-bit | `Playwright-Studio-*-x64-Setup.exe` |
| 🪟 Windows | 32-bit | `Playwright-Studio-*-ia32-Setup.exe` |
| 🪟 Windows | Portable | `Playwright-Studio-*-Portable.exe` |
| 🐧 Linux | x64 | `Playwright-Studio-*.AppImage` / `.deb` / `.rpm` |

### Installation Notes

**macOS** — After opening the `.dmg` and dragging to Applications, on first launch right-click the app → **Open** → **Open Anyway** (Gatekeeper warning for unsigned apps).

If macOS still blocks the app, run this command in Terminal to remove the quarantine flag:
```bash
xattr -rd com.apple.quarantine "/Applications/Playwright Studio.app"
```

**Windows** — If Windows SmartScreen warns, click **More info** → **Run anyway**.

**Linux** — AppImage needs execute permission: `chmod +x Playwright-Studio-*.AppImage && ./Playwright-Studio-*.AppImage`

---

## ✨ Features

- 🎙️ **Visual Test Recorder** — Record user interactions by browsing normally inside the built-in browser
- ▶️ **Test Runner** — Run recorded steps directly inside the app with real-time status feedback
- 📝 **Multi-language Code Export** — Export to TypeScript (Playwright), Java (Playwright) or Cucumber Gherkin `.feature` files
- 🥒 **Cucumber Integration** — Generates Gherkin feature files compatible with your existing Cucumber step definitions
- 🔍 **Element Inspector** — Inspect any element and get smart selector suggestions (role, label, testid, CSS, XPath)
- 💾 **Project Management** — Save, open and organise test projects
- 🌐 **Cross-domain Recording** — Records across page navigations and cross-origin domains
- 🖥️ **Cross-platform** — macOS (arm64 + x64), Windows (x64 + ia32) and Linux (x64)

---

## 🚀 Getting Started (Development)

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20+ |
| pnpm | 9+ |
| Python | 3.9+ (for icon generation only) |

### Install & Run

```bash
# 1. Clone the repository
git clone https://github.com/afsarali273/Playwright-Studio.git
cd Playwright-Studio

# 2. Install dependencies
pnpm install

# 3a. Run in development mode (hot reload)
# Terminal 1 — start Vite dev server
pnpm run dev:renderer

# Terminal 2 — start Electron (loads from localhost:5173)
pnpm run dev:electron

# 3b. Run in production mode locally
pnpm run build:electron && pnpm run build:renderer
NODE_ENV=production pnpm run dev:electron
```

---

## 🏗️ Project Structure

```
Playwright-Studio/
├── src/
│   ├── main/                    # Electron main process (Node.js)
│   │   ├── index.ts             # App entry point, window creation
│   │   ├── core/
│   │   │   ├── browser-manager.ts   # BrowserView lifecycle & header interception
│   │   │   └── event-bus.ts         # Internal event bus
│   │   ├── generator/
│   │   │   ├── script-generator.ts  # Orchestrates all language generators
│   │   │   ├── cucumber-mapper.ts   # Maps steps → Gherkin steps
│   │   │   ├── gherkin-mapper.ts    # Alternative Gherkin mapper
│   │   │   └── java-mapper.ts       # Maps steps → Java Playwright code
│   │   ├── ipc/
│   │   │   └── handlers.ts          # All IPC channel handlers
│   │   ├── recorder/            # Page injection & event capture
│   │   ├── runner/              # Step execution engine
│   │   ├── storage/             # Project save/load (JSON)
│   │   └── plugins/             # Plugin interface
│   ├── renderer/                # React UI (Vite)
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── components/          # UI components
│   │   ├── stores/              # Zustand state stores
│   │   ├── hooks/               # React hooks
│   │   └── types/               # Renderer-specific types
│   └── shared/
│       ├── types.ts             # Shared TypeScript types
│       ├── constants.ts         # App-wide constants
│       └── ipc-channels.ts      # IPC channel name constants
├── assets/                      # App icons (icns / ico / png)
├── scripts/
│   └── generate-icons.py        # Icon generation from master PNG
├── .github/
│   └── workflows/
│       ├── ci.yml               # CI — type check + build on every push/PR
│       └── release.yml          # Release — builds DMG/EXE/AppImage on tag push
└── package.json                 # electron-builder config lives here
```

---

## 🎙️ Recording a Test

1. **Launch** Playwright Studio
2. **Enter a URL** in the address bar and press Enter — the built-in browser navigates to the page
3. **Click Record** (⏺) in the toolbar — the recorder starts capturing your interactions
4. **Interact** with the page normally:
   - Click buttons, links, inputs
   - Type into fields
   - Select dropdown options
   - Hover over elements
   - Scroll the page
5. **Add Assertions** using the assertion panel — choose an element and assertion type
6. **Stop Recording** (⏹) when done
7. Steps appear in the **Step List** panel on the left

### Supported Recorded Actions

| Action | Description |
|--------|-------------|
| `navigate` | Page navigation (URL change) |
| `click` | Single click on any element |
| `dblclick` | Double click |
| `input` / `change` | Typing into input, textarea or contenteditable |
| `keydown` | Keyboard key press (e.g. Enter, Tab, Escape) |
| `select` | Selecting an option from a `<select>` dropdown |
| `check` | Checking a checkbox or radio button |
| `uncheck` | Unchecking a checkbox |
| `hover` | Mouse hover over an element |
| `scroll` | Scrolling to an element |
| `wait` | Explicit wait/pause |
| `screenshot` | Capture a screenshot |
| `assert` | Assertion on an element or page state |

---

## ✅ Assertions

Click the **Assert** button or right-click any element in the browser panel to add an assertion. The following assertion types are supported:

| Assertion Type | Description |
|----------------|-------------|
| `toBeVisible` | Element is visible on the page |
| `toBeHidden` | Element is not visible |
| `toExist` | Element exists in the DOM |
| `toBeEnabled` | Form element is enabled |
| `toBeDisabled` | Form element is disabled |
| `toHaveText` | Element has exact text content |
| `toContainText` | Element contains partial text |
| `toHaveAttribute` | Element has a specific attribute value |
| `toHaveClass` | Element has a specific CSS class |
| `toHaveCount` | Number of matching elements equals N |
| `toHaveValue` | Input/select has a specific value |
| `toBeEmpty` | Element is empty |
| `toBeChecked` | Checkbox/radio is checked |
| `toBeUnchecked` | Checkbox/radio is unchecked |
| `toHaveURL` | Current page URL matches |
| `toHaveTitle` | Page title matches |

---

## 📤 Exporting Tests

After recording, click **Export** in the toolbar to open the export dialog. Select your target language:

### TypeScript (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('Login Test', async ({ page }) => {
  // Navigate to https://example.com/login
  await page.goto('https://example.com/login');

  // Type "admin" into getByLabel('Username')
  await page.getByLabel('Username').fill('admin');

  // Type "password123" into getByLabel('Password')
  await page.getByLabel('Password').fill('password123');

  // Click getByRole('button', { name: 'Login' })
  await page.getByRole('button', { name: 'Login' }).click();

  // Assert current URL contains "dashboard"
  await expect(page).toHaveURL(/dashboard/);
});
```

### Java (Playwright)

```java
import com.microsoft.playwright.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

public class LoginTest {
    public static void main(String[] args) {
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch(
                new BrowserType.LaunchOptions().setHeadless(false)
            );
            BrowserContext context = browser.newContext();
            Page page = context.newPage();

            // Navigate to https://example.com/login
            page.navigate("https://example.com/login");

            // Type into username field
            page.getByLabel("Username").fill("admin");

            // Type into password field
            page.getByLabel("Password").fill("password123");

            // Click login button
            page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Login")).click();

            context.close();
            browser.close();
        }
    }
}
```

### Cucumber Gherkin (`.feature`)

```gherkin
Feature: Login

Scenario: Login Test

Given web open browser

And web navigate to "https://example.com/login"

When web type "admin" into "getByLabel('Username')"

And web type "password123" into "getByLabel('Password')"

And web click element "getByRole('button',{name:'Login'})"

Then web current url should contain "dashboard"
```

---

## 🥒 Cucumber Step Definitions

The Gherkin export maps to a library of pre-defined step definitions. Below is the full reference:

### Navigation & Browser
```gherkin
Given web open browser
Given web navigate to {string}
When web close browser
When web refresh page
When web navigate back
When web navigate forward
```

### Element Interactions
```gherkin
When web click element {string}
When web click text {string}
When web type {string} into {string}
When web type {string} into {string} and press enter
When web clear {string}
When web select {string} from dropdown {string}
When web upload file {string} to {string}
When web check {string}
When web uncheck {string}
When web hover over {string}
When web double click {string}
When web drag {string} to {string}
```

### Waiting
```gherkin
When web wait for visible {string} for {int} seconds
When web wait for clickable {string} for {int} seconds
When web wait for invisible {string} for {int} seconds
When web pause for {int} seconds
When web wait for page load
When web wait for element {string} to be present
When web wait for element {string} to disappear
When web wait for text {string} to appear
When web wait for text {string} to disappear
When web wait for URL to contain {string}
When web wait for title to be {string}
When web wait for element count of {string} to be {int}
When web wait for alert to be present
When web wait for {int} milliseconds
```

### Assertions
```gherkin
Then web element {string} should be visible
Then web element {string} should not be visible
Then web element {string} should contain text {string}
Then web element {string} text should be {string}
Then web page should contain text {string}
Then web element {string} attribute {string} should be {string}
Then web element {string} css {string} should be {string}
Then web element {string} should be enabled
Then web element {string} should be disabled
Then web element count of {string} should be {int}
Then web element count of {string} should be greater than {int}
Then web element {string} should exist
Then web element {string} should not exist
Then web checkbox {string} should be checked
Then web checkbox {string} should not be checked
Then web radio button {string} should be selected
Then web current url should be {string}
Then web current url should contain {string}
Then web current url should start with {string}
Then web current url should end with {string}
Then web current url should match regex {string}
Then web page title should be {string}
Then web page title should contain {string}
Then web element {string} should be focused
Then web element {string} should be clickable
Then web element {string} should be editable
Then web element {string} attribute {string} should contain {string}
Then web element {string} attribute {string} should not exist
Then web input value of {string} should be {string}
Then web selected option in dropdown {string} should be {string}
Then web dropdown {string} should have option {string}
Then web element {string} text should match regex {string}
Then web element {string} text should not be empty
Then web alert text should be {string}
Then web alert should be present
Then web tag name of {string} should be {string}
```

### Keyboard Actions
```gherkin
When web press key {string} on element {string}
When web press enter on element {string}
When web press keyboard key {string}
When web press enter key
When web press escape key
When web press tab key
```

### Scroll Actions
```gherkin
When web scroll to element {string}
When web scroll to top
When web scroll to bottom
When web scroll by {int} pixels horizontally and {int} pixels vertically
When web scroll {string} into center
```

### Tabs & Windows
```gherkin
When web open new tab
When web switch to latest tab
When web close current tab
When web switch to tab {int}
When web maximize window
When web set window size to {int}x{int}
```

### Screenshots & Variables
```gherkin
When web take screenshot {string}
When web take element screenshot {string} save as {string}
When web save text of {string} as {string}
When web save attribute {string} of {string} as {string}
When web save current url as {string}
When web save page title as {string}
When web save input value of {string} as {string}
```

### Alerts, Frames & Cookies
```gherkin
When web accept alert
When web dismiss alert
When web switch to frame {string}
When web switch to default content
When web add cookie {string} with value {string}
When web delete all cookies
When web execute js {string}
```

### Locator Examples

Playwright Studio generates smart locators. You can use any of these in your step definitions:

```gherkin
# Playwright role-based locators
When web click element "getByRole('button',{name:'Submit'})"
When web type "hello" into "getByLabel('Email')"
When web click element "getByText('Sign In')"
When web click element "getByPlaceholder('Search...')"
When web click element "getByTestId('login-button')"

# CSS selectors
When web click element "#submit-btn"
When web type "hello" into ".email-input"

# XPath
When web click element "//button[text()='Login']"
When web type "hello" into "//input[@name='email']"
```

---

## ▶️ Running Tests

### Run All Steps
Click the **▶ Run All** button in the toolbar to execute all recorded steps sequentially.

### Run From a Step
Right-click any step → **Run From Here** to start execution from that step.

### Run a Single Step
Right-click any step → **Run This Step** to execute only that step.

### Step Status Indicators

| Status | Colour | Meaning |
|--------|--------|---------|
| `idle` | Grey | Not yet executed |
| `running` | Blue | Currently executing |
| `passed` | Green | Executed successfully |
| `failed` | Red | Execution failed (error shown) |
| `skipped` | Yellow | Skipped during partial run |

---

## 🔧 Build & Package

### Build for Development
```bash
# Build TypeScript (main process) — always first
pnpm run build:electron

# Build React UI (renderer) — always last (Vite must not be overwritten by tsc)
pnpm run build:renderer
```

### Package Locally
```bash
# macOS — Apple Silicon (arm64)
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm exec electron-builder --mac dmg --arm64 --publish never

# macOS — Intel (x64)
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm exec electron-builder --mac dmg --x64 --publish never

# Windows — 64-bit
pnpm exec electron-builder --win nsis --x64 --publish never

# Windows — 32-bit
pnpm exec electron-builder --win nsis --ia32 --publish never

# Linux — AppImage + deb + rpm
pnpm exec electron-builder --linux AppImage deb rpm --x64 --publish never
```

Output is placed in the `release/` directory.

---

## 🚀 Release Pipeline (GitHub Actions)

### Trigger a Release

```bash
# Tag a version and push — GitHub Actions does the rest
git tag v1.0.0
git push origin v1.0.0
```

Or trigger manually from **GitHub → Actions → 🚀 Playwright Studio — Release → Run workflow**.

### Pipeline Overview

```
push tag v*.*.*
       │
       ├──► 🍎 build-macos    →  arm64 .dmg + x64 .dmg
       ├──► 🪟 build-windows  →  x64 .exe + ia32 .exe + Portable .exe
       └──► 🐧 build-linux    →  .AppImage + .deb + .rpm
                │ (all 3 must pass)
                ▼
           🎉 release — creates GitHub Release with all installers attached
```

### Pre-release Tags

Tags containing `beta`, `alpha` or `rc` are automatically marked as **pre-releases**:
```bash
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

### Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `.github/workflows/ci.yml` | Push / PR to `main` | Type check + full build verification |
| `.github/workflows/release.yml` | Push `v*.*.*` tag | Build all platforms + publish GitHub Release |

---

## ⚙️ Configuration

### Project Settings

Each project stores a `config.json` with:

```json
{
  "name": "My Test Project",
  "version": "1.0.0",
  "baseUrl": "https://example.com",
  "browserType": "chromium",
  "headless": false,
  "viewport": { "width": 1280, "height": 720 },
  "timeout": 30000
}
```

### Supported Browsers

| Browser | Key |
|---------|-----|
| Chromium (default) | `chromium` |
| Firefox | `firefox` |
| WebKit (Safari) | `webkit` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 40 |
| UI framework | React 19 + TypeScript |
| UI bundler | Vite 5 |
| UI components | Radix UI + Tailwind CSS |
| State management | Zustand |
| Browser automation | Playwright 1.58 |
| Code generation | Custom mappers (TS/Java/Gherkin) |
| Packaging | electron-builder 24 |
| CI/CD | GitHub Actions |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

Please make sure `pnpm run build:electron && pnpm run build:renderer` passes before opening a PR.

---

## 📄 License

```
MIT License

Copyright (c) 2025 Afsar Ali

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  <sub>Built with ❤️ using <a href="https://www.electronjs.org/">Electron</a> + <a href="https://playwright.dev/">Playwright</a></sub>
</div>

