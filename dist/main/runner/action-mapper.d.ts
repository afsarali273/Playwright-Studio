/**
 * ActionMapper — Maps TestStep actions to Playwright Page method calls.
 * Returns an async function that, given a Playwright Page, executes the step.
 */
import type { Page } from 'playwright-core';
import type { TestStep } from '../../shared/types';
export interface MappedAction {
    /** Execute this action on the given Playwright page */
    execute: (page: Page) => Promise<void>;
    /** Playwright code snippet (for script generation) */
    code: string;
}
/**
 * Map a single TestStep to a Playwright action.
 */
export declare function mapStepToAction(step: TestStep): MappedAction;
//# sourceMappingURL=action-mapper.d.ts.map