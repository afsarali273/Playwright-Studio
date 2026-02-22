/**
 * ScriptGenerator - Converts TestSteps into a valid Playwright test file.
 * Generates idiomatic test code using the @playwright/test framework syntax.
 */
import type { TestStep, ProjectConfig } from '../../shared/types';
export declare class ScriptGenerator {
    /**
     * Generate a complete Playwright test file from steps.
     */
    generate(steps: TestStep[], config?: Partial<ProjectConfig>): string;
    /**
     * Generate a test file with multiple test blocks grouped by navigation.
     */
    generateGrouped(steps: TestStep[], config?: Partial<ProjectConfig>): string;
    /**
     * Generate a Playwright config file.
     */
    generateConfig(config: Partial<ProjectConfig>): string;
    private groupByNavigation;
    private escapeQuotes;
}
//# sourceMappingURL=script-generator.d.ts.map