"use strict";
/**
 * ActionMapper — Maps TestStep actions to Playwright Page method calls.
 * Returns an async function that, given a Playwright Page, executes the step.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStepToAction = mapStepToAction;
/**
 * Helper to get a Locator from a selector string.
 * Supports both CSS/XPath strings and Playwright locator methods (getBy...).
 */
function getLocator(page, selector) {
    if (selector.startsWith('getBy') || selector.startsWith('locator(')) {
        try {
            // Dynamically evaluate locator methods (e.g. "getByRole('button', { name: 'Save' })")
            // This is safe here as selector comes from our trusted recorder.
            const func = new Function('page', `return page.${selector}`);
            return func(page);
        }
        catch (error) {
            console.warn('Failed to evaluate locator expression:', selector, error);
            // Fallback: try as a raw string selector
            return page.locator(selector);
        }
    }
    return page.locator(selector);
}
/**
 * Helper to generate code snippet for the locator.
 */
function getLocatorCode(selector) {
    if (selector.startsWith('getBy') || selector.startsWith('locator(')) {
        return `page.${selector}`;
    }
    return `page.locator('${escapeQuotes(selector)}')`;
}
/**
 * Map a single TestStep to a Playwright action.
 */
function mapStepToAction(step) {
    const { action, selector, value } = step;
    // Actions that don't use a locator
    if (action === 'navigate') {
        return {
            execute: async (page) => {
                await page.goto(value ?? selector, {
                    waitUntil: 'domcontentloaded',
                    timeout: 30000,
                });
            },
            code: `  await page.goto('${escapeQuotes(value ?? selector)}');`,
        };
    }
    if (action === 'wait') {
        return {
            execute: async (page) => {
                const ms = parseInt(value ?? '1000', 10);
                await page.waitForTimeout(ms);
            },
            code: `  await page.waitForTimeout(${value ?? '1000'});`,
        };
    }
    if (action === 'screenshot') {
        return {
            execute: async (page) => {
                await page.screenshot({ path: value ?? 'screenshot.png', fullPage: false });
            },
            code: `  await page.screenshot({ path: '${escapeQuotes(value ?? 'screenshot.png')}' });`,
        };
    }
    // Locator-based actions
    const locatorCode = getLocatorCode(selector);
    switch (action) {
        case 'click':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).click({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.click();`,
            };
        case 'dblclick':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).dblclick({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.dblclick();`,
            };
        case 'input':
        case 'change':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).fill(value ?? '', { timeout: 10000 });
                },
                code: `  await ${locatorCode}.fill('${escapeQuotes(value ?? '')}');`,
            };
        case 'select':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).selectOption(value ?? '', { timeout: 10000 });
                },
                code: `  await ${locatorCode}.selectOption('${escapeQuotes(value ?? '')}');`,
            };
        case 'check':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).check({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.check();`,
            };
        case 'uncheck':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).uncheck({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.uncheck();`,
            };
        case 'hover':
            return {
                execute: async (page) => {
                    await getLocator(page, selector).hover({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.hover();`,
            };
        case 'keydown':
            return {
                execute: async (page) => {
                    await getLocator(page, selector || 'body').press(value ?? 'Enter', { timeout: 10000 });
                },
                code: `  await ${locatorCode}.press('${escapeQuotes(value ?? 'Enter')}');`,
            };
        case 'scroll':
            return {
                execute: async (page) => {
                    const loc = getLocator(page, selector);
                    await loc.scrollIntoViewIfNeeded({ timeout: 10000 });
                },
                code: `  await ${locatorCode}.scrollIntoViewIfNeeded();`,
            };
        case 'assert':
            const assertionType = step.assertionType || 'toBeVisible';
            const assertionValue = step.assertionValue ?? '';
            return {
                execute: async (page) => {
                    // Need to import expect, but we are inside a function.
                    // Since we are running in the main process, we might not have access to @playwright/test assertions easily 
                    // without a runner context.
                    // The RunnerEngine uses `expect` from @playwright/test if available, or we mock it?
                    // Wait, the RunnerEngine imports @playwright/test.
                    // But this mapper returns an execute function.
                    // We assume the caller context has `expect` available or we use basic checks.
                    // Actually, for the "Run" feature in the IDE, we usually need to execute these checks.
                    // If we don't have the full test runner, we can implement basic checks using locator API.
                    const loc = getLocator(page, selector);
                    if (assertionType === 'toBeVisible') {
                        await loc.waitFor({ state: 'visible', timeout: 5000 });
                    }
                    else if (assertionType === 'toHaveText') {
                        const text = await loc.innerText();
                        if (!text.includes(assertionValue))
                            throw new Error(`Expected text "${assertionValue}", found "${text}"`);
                    }
                    else if (assertionType === 'toHaveValue') {
                        const val = await loc.inputValue();
                        if (val !== assertionValue)
                            throw new Error(`Expected value "${assertionValue}", found "${val}"`);
                    }
                    else if (assertionType === 'toContainText') {
                        const text = await loc.textContent();
                        if (!text?.includes(assertionValue))
                            throw new Error(`Expected text to contain "${assertionValue}", found "${text}"`);
                    }
                    else if (assertionType === 'toHaveAttribute') {
                        // value format: "attr=val" or just "attr"
                        // simplistic parsing
                        const [attr, val] = assertionValue.split('=');
                        const actual = await loc.getAttribute(attr);
                        if (val && actual !== val)
                            throw new Error(`Expected attribute ${attr}="${val}", found "${actual}"`);
                        if (!val && actual === null)
                            throw new Error(`Expected attribute ${attr} to exist`);
                    }
                    else if (assertionType === 'toHaveCount') {
                        const count = await loc.count();
                        const expected = parseInt(assertionValue, 10);
                        if (count !== expected)
                            throw new Error(`Expected count ${expected}, found ${count}`);
                    }
                },
                code: (() => {
                    const loc = getLocatorCode(selector);
                    if (assertionType === 'toBeVisible') {
                        return `  await expect(${loc}).toBeVisible();`;
                    }
                    else if (assertionType === 'toHaveText') {
                        return `  await expect(${loc}).toHaveText('${escapeQuotes(assertionValue)}');`;
                    }
                    else if (assertionType === 'toHaveValue') {
                        return `  await expect(${loc}).toHaveValue('${escapeQuotes(assertionValue)}');`;
                    }
                    else if (assertionType === 'toContainText') {
                        return `  await expect(${loc}).toContainText('${escapeQuotes(assertionValue)}');`;
                    }
                    else if (assertionType === 'toHaveAttribute') {
                        const parts = assertionValue.split('=');
                        const attr = parts[0];
                        const val = parts.slice(1).join('=');
                        if (val) {
                            return `  await expect(${loc}).toHaveAttribute('${escapeQuotes(attr)}', '${escapeQuotes(val)}');`;
                        }
                        return `  await expect(${loc}).toHaveAttribute('${escapeQuotes(attr)}', /.*/);`; // Check existence
                    }
                    else if (assertionType === 'toHaveCount') {
                        return `  await expect(${loc}).toHaveCount(${assertionValue});`;
                    }
                    return `  await expect(${loc}).toBeVisible();`;
                })()
            };
        default:
            return {
                execute: async () => {
                    throw new Error(`Unknown action: ${action}`);
                },
                code: `  // Unknown action: ${action}`,
            };
    }
}
/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
}
//# sourceMappingURL=action-mapper.js.map