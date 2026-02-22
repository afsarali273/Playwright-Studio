import { TestStep } from '../../shared/types';

export class GherkinMapper {
  static map(steps: TestStep[]): string {
    const featureName = 'User journey';
    const scenarioName = 'Automated web test';

    let featureFile = `Feature: ${featureName}\n\n`;
    featureFile += `  Scenario: ${scenarioName}\n`;
    featureFile += `    Given web open browser\n`;

    steps.forEach(step => {
      featureFile += `    ${this.mapStepToGherkin(step)}\n`;
    });

    return featureFile;
  }

  private static mapStepToGherkin(step: TestStep): string {
    const { action, selector, value, assertionType, assertionValue } = step;

    // Clean selector by removing 'page.' prefix if present
    let cleanSelector = selector;
    if (selector.startsWith('page.')) {
      cleanSelector = selector.substring(5);
    }

    switch (action) {
      case 'navigate':
        let url = value ?? selector;
        // Strip backticks and spaces if present
        if (url) {
          url = url.trim().replace(/^`|`$/g, '').trim();
        }
        return `And web navigate to "${escapeQuotes(url)}"`;

      case 'click':
        return `When web click element "${escapeQuotes(cleanSelector)}"`;

      case 'dblclick':
        return `When web double click "${escapeQuotes(cleanSelector)}"`;

      case 'input':
      case 'change':
        return `When web type "${escapeQuotes(value ?? '')}" into "${escapeQuotes(cleanSelector)}"`;

      case 'keydown':
        if (value === 'Enter') {
          return `When web press enter on element "${escapeQuotes(cleanSelector)}"`;
        }
        return `When web press key "${escapeQuotes(value ?? 'Enter')}" on element "${escapeQuotes(cleanSelector)}"`;

      case 'select':
        return `When web select "${escapeQuotes(value ?? '')}" from dropdown "${escapeQuotes(cleanSelector)}"`;

      case 'check':
        return `When web check "${escapeQuotes(cleanSelector)}"`;

      case 'uncheck':
        return `When web uncheck "${escapeQuotes(cleanSelector)}"`;

      case 'hover':
        return `When web hover over "${escapeQuotes(cleanSelector)}"`;

      case 'scroll':
        return `When web scroll to element "${escapeQuotes(cleanSelector)}"`;

      case 'wait':
        const seconds = Math.ceil(parseInt(value ?? '1000', 10) / 1000);
        return `When web pause for ${seconds} seconds`;

      case 'screenshot':
        return `When web take screenshot "${escapeQuotes(value ?? 'screenshot.png')}"`;

      case 'assert':
        const assertType = assertionType || 'toBeVisible';
        const assertVal = assertionValue ?? '';

        if (assertType === 'toBeVisible') {
          return `Then web element "${escapeQuotes(cleanSelector)}" should be visible`;
        } else if (assertType === 'toBeHidden') {
          return `Then web element "${escapeQuotes(cleanSelector)}" should not be visible`;
        } else if (assertType === 'toHaveText') {
          return `Then web element "${escapeQuotes(cleanSelector)}" text should be "${escapeQuotes(assertVal)}"`;
        } else if (assertType === 'toContainText') {
          return `Then web element "${escapeQuotes(cleanSelector)}" should contain text "${escapeQuotes(assertVal)}"`;
        } else if (assertType === 'toHaveValue') {
          return `Then web input value of "${escapeQuotes(cleanSelector)}" should be "${escapeQuotes(assertVal)}"`;
        } else if (assertType === 'toHaveAttribute') {
          const parts = assertVal.split('=');
          const attr = parts[0];
          const val = parts.slice(1).join('=');

          if (val) {
            return `Then web element "${escapeQuotes(cleanSelector)}" attribute "${escapeQuotes(attr)}" should be "${escapeQuotes(val)}"`;
          }
          return `Then web element "${escapeQuotes(cleanSelector)}" attribute "${escapeQuotes(attr)}" should not be empty`;
        } else if (assertType === 'toHaveCount') {
          return `Then web element count of "${escapeQuotes(cleanSelector)}" should be ${assertVal}`;
        } else if (assertType === 'toBeEnabled') {
          return `Then web element "${escapeQuotes(cleanSelector)}" should be enabled`;
        } else if (assertType === 'toBeDisabled') {
          return `Then web element "${escapeQuotes(cleanSelector)}" should be disabled`;
        } else if (assertType === 'toBeChecked') {
          return `Then web checkbox "${escapeQuotes(cleanSelector)}" should be checked`;
        } else if (assertType === 'toBeUnchecked') {
          return `Then web checkbox "${escapeQuotes(cleanSelector)}" should not be checked`;
        } else if (assertType === 'toHaveURL') {
          return `Then web current url should be "${escapeQuotes(assertVal)}"`;
        } else if (assertType === 'toHaveTitle') {
          return `Then web page title should be "${escapeQuotes(assertVal)}"`;
        }
        return `Then web element "${escapeQuotes(cleanSelector)}" should be visible`;

      default:
        return `# Unsupported action: ${action}`;
    }
  }
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}
