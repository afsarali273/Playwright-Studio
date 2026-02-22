import type { TestStep } from '../../shared/types';

/**
 * Map a single TestStep to a Cucumber Gherkin step string.
 */
export function mapStepToCucumber(step: TestStep): string {
  const { action, selector, value, assertionType, assertionValue } = step;

  // Clean selector by removing 'page.' prefix if present
  let cleanSelector = selector;
  if (selector.startsWith('page.')) {
    cleanSelector = selector.substring(5);
  }

  // Actions that don't use a locator
  if (action === 'navigate') {
    let url = value ?? selector;
    // Strip backticks and spaces if present
    if (url) {
      url = url.trim().replace(/^`|`$/g, '').trim();
    }
    return `And web navigate to "${escapeQuotes(url)}"`;
  }

  if (action === 'wait') {
    const seconds = Math.ceil(parseInt(value ?? '1000', 10) / 1000);
    return `When web pause for ${seconds} seconds`;
  }

  if (action === 'screenshot') {
    return `When web take screenshot "${escapeQuotes(value ?? 'screenshot.png')}"`;
  }

  // Locator-based actions
  const loc = escapeQuotes(cleanSelector);

  switch (action) {
    case 'click':
      return `When web click element "${loc}"`;

    case 'dblclick':
      return `When web double click "${loc}"`;

    case 'input':
    case 'change':
      return `When web type "${escapeQuotes(value ?? '')}" into "${loc}"`;

    case 'select':
      return `When web select "${escapeQuotes(value ?? '')}" from dropdown "${loc}"`;

    case 'check':
      return `When web check "${loc}"`;

    case 'uncheck':
      return `When web uncheck "${loc}"`;

    case 'hover':
      return `When web hover over "${loc}"`;

    case 'keydown':
      if (value === 'Enter') {
        return `When web press enter on element "${loc}"`;
      }
      return `When web press key "${escapeQuotes(value ?? 'Enter')}" on element "${loc}"`;

    case 'scroll':
      return `When web scroll to element "${loc}"`;

    case 'assert':
      const assertType = assertionType || 'toBeVisible';
      const assertVal = assertionValue ?? '';

      if (assertType === 'toBeVisible') {
        return `Then web element "${loc}" should be visible`;
      } else if (assertType === 'toBeHidden') {
        return `Then web element "${loc}" should not be visible`;
      } else if (assertType === 'toHaveText') {
        return `Then web element "${loc}" text should be "${escapeQuotes(assertVal)}"`;
      } else if (assertType === 'toContainText') {
        return `Then web element "${loc}" should contain text "${escapeQuotes(assertVal)}"`;
      } else if (assertType === 'toHaveValue') {
        return `Then web input value of "${loc}" should be "${escapeQuotes(assertVal)}"`;
      } else if (assertType === 'toHaveAttribute') {
        const parts = assertVal.split('=');
        const attr = parts[0];
        const val = parts.slice(1).join('=');

        if (val) {
          return `Then web element "${loc}" attribute "${escapeQuotes(attr)}" should be "${escapeQuotes(val)}"`;
        }
        return `Then web element "${loc}" attribute "${escapeQuotes(attr)}" should not be empty`;
      } else if (assertType === 'toHaveCount') {
        return `Then web element count of "${loc}" should be ${assertVal}`;
      } else if (assertType === 'toBeEnabled') {
        return `Then web element "${loc}" should be enabled`;
      } else if (assertType === 'toBeDisabled') {
        return `Then web element "${loc}" should be disabled`;
      } else if (assertType === 'toBeChecked') {
        return `Then web checkbox "${loc}" should be checked`;
      } else if (assertType === 'toBeUnchecked') {
        return `Then web checkbox "${loc}" should not be checked`;
      }
      return `Then web element "${loc}" should be visible`;

    default:
      return `  # Unknown action: ${action}`;
  }
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}
