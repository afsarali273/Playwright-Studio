/**
 * ScriptGenerator - Converts TestSteps into a valid Playwright test file.
 * Generates idiomatic test code using the @playwright/test framework syntax.
 */

import type { TestStep, ProjectConfig } from '../../shared/types';
import { mapStepToAction } from '../runner/action-mapper';

export class ScriptGenerator {
  /**
   * Generate a complete Playwright test file from steps.
   */
  generate(steps: TestStep[], config?: Partial<ProjectConfig>): string {
    const testName = config?.name ?? 'Generated Test';
    const lines: string[] = [];

    /* Imports */
    lines.push("import { test, expect } from '@playwright/test';");
    lines.push('');

    /* Test block */
    lines.push(`test('${this.escapeQuotes(testName)}', async ({ page }) => {`);

    for (const step of steps) {
      /* Add a comment describing the step */
      if (step.description) {
        lines.push(`  // ${step.description}`);
      }

      /* Map the step to Playwright code */
      const mapped = mapStepToAction(step);
      lines.push(mapped.code);
      lines.push('');
    }

    lines.push('});');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate a test file with multiple test blocks grouped by navigation.
   */
  generateGrouped(steps: TestStep[], config?: Partial<ProjectConfig>): string {
    const projectName = config?.name ?? 'Generated Test Suite';
    const lines: string[] = [];

    lines.push("import { test, expect } from '@playwright/test';");
    lines.push('');
    lines.push(`test.describe('${this.escapeQuotes(projectName)}', () => {`);

    /* Group steps by navigation boundaries */
    const groups = this.groupByNavigation(steps);

    groups.forEach((group, index) => {
      const testLabel = group.url
        ? `Test ${index + 1}: ${group.url}`
        : `Test ${index + 1}`;

      lines.push('');
      lines.push(`  test('${this.escapeQuotes(testLabel)}', async ({ page }) => {`);

      for (const step of group.steps) {
        if (step.description) {
          lines.push(`    // ${step.description}`);
        }
        const mapped = mapStepToAction(step);
        /* Indent code lines by 2 more spaces within nested test */
        lines.push('  ' + mapped.code);
      }

      lines.push('  });');
    });

    lines.push('});');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Generate a Playwright config file.
   */
  generateConfig(config: Partial<ProjectConfig>): string {
    return `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: ${config.timeout ?? 30000},
  retries: 1,
  use: {
    baseURL: '${this.escapeQuotes(config.baseUrl ?? 'http://localhost:3000')}',
    headless: ${config.headless ?? false},
    viewport: { width: ${config.viewport?.width ?? 1280}, height: ${config.viewport?.height ?? 720} },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
});
`;
  }

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  private groupByNavigation(
    steps: TestStep[],
  ): Array<{ url?: string; steps: TestStep[] }> {
    const groups: Array<{ url?: string; steps: TestStep[] }> = [];
    let currentGroup: { url?: string; steps: TestStep[] } = { steps: [] };

    for (const step of steps) {
      if (step.action === 'navigate') {
        /* Start a new group on navigation */
        if (currentGroup.steps.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = { url: step.value ?? step.selector, steps: [step] };
      } else {
        currentGroup.steps.push(step);
      }
    }

    if (currentGroup.steps.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private escapeQuotes(str: string): string {
    return str.replace(/'/g, "\\'");
  }
}
