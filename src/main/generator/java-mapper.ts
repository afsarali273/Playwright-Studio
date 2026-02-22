
import type { TestStep } from '../../shared/types';

/**
 * Map a single TestStep to a Playwright Java code snippet.
 */
export function mapStepToJava(step: TestStep): string {
  const { action, selector, value } = step;

  // Actions that don't use a locator
  if (action === 'navigate') {
    let url = value ?? selector;
    // Strip backticks and spaces if present (common artifact from recorder templates)
    if (url) {
        url = url.trim().replace(/^`|`$/g, '').trim();
    }
    return `    page.navigate("${escapeQuotes(url)}");`;
  }

  if (action === 'wait') {
    return `    page.waitForTimeout(${value ?? '1000'});`;
  }

  if (action === 'screenshot') {
    return `    page.screenshot(new Page.ScreenshotOptions().setPath(Paths.get("${escapeQuotes(value ?? 'screenshot.png')}")));`;
  }

  // Locator-based actions
  const locatorCode = convertSelectorToJava(selector);

  switch (action) {
    case 'click':
      return `    ${locatorCode}.click();`;

    case 'dblclick':
      return `    ${locatorCode}.dblclick();`;

    case 'input':
    case 'change':
      return `    ${locatorCode}.fill("${escapeQuotes(value ?? '')}");`;

    case 'select':
      return `    ${locatorCode}.selectOption("${escapeQuotes(value ?? '')}");`;

    case 'check':
      return `    ${locatorCode}.check();`;

    case 'uncheck':
      return `    ${locatorCode}.uncheck();`;

    case 'hover':
      return `    ${locatorCode}.hover();`;

    case 'keydown':
      return `    ${locatorCode}.press("${escapeQuotes(value ?? 'Enter')}");`;

    case 'scroll':
      return `    ${locatorCode}.scrollIntoViewIfNeeded();`;

    case 'assert':
      const assertionType = step.assertionType || 'toBeVisible';
      const assertionValue = step.assertionValue ?? '';
      
      if (assertionType === 'toBeVisible') {
          return `    assertThat(${locatorCode}).isVisible();`;
      } else if (assertionType === 'toHaveText') {
          return `    assertThat(${locatorCode}).hasText("${escapeQuotes(assertionValue)}");`;
      } else if (assertionType === 'toHaveValue') {
          return `    assertThat(${locatorCode}).hasValue("${escapeQuotes(assertionValue)}");`;
      } else if (assertionType === 'toContainText') {
          return `    assertThat(${locatorCode}).containsText("${escapeQuotes(assertionValue)}");`;
      } else if (assertionType === 'toHaveAttribute') {
          const parts = assertionValue.split('=');
          const attr = parts[0];
          const val = parts.slice(1).join('=');
          
          if (val) {
              return `    assertThat(${locatorCode}).hasAttribute("${escapeQuotes(attr)}", "${escapeQuotes(val)}");`;
          }
          return `    assertThat(${locatorCode}).hasAttribute("${escapeQuotes(attr)}", Pattern.compile(".*"));`;
      } else if (assertionType === 'toHaveCount') {
           return `    assertThat(${locatorCode}).hasCount(${assertionValue});`;
      }
      return `    assertThat(${locatorCode}).isVisible();`;

    default:
      return `    // Unknown action: ${action}`;
  }
}

function convertSelectorToJava(selector: string): string {
  // Strip 'page.' prefix if present
  let cleanSelector = selector;
  if (selector.startsWith('page.')) {
    cleanSelector = selector.substring(5);
  }

  // Handle chained methods (.first(), .last(), .nth(i))
  const suffixes: string[] = [];
  let baseSelector = cleanSelector;

  while (true) {
      if (baseSelector.endsWith('.first()')) {
          suffixes.unshift('.first()');
          baseSelector = baseSelector.slice(0, -8);
      } else if (baseSelector.endsWith('.last()')) {
          suffixes.unshift('.last()');
          baseSelector = baseSelector.slice(0, -7);
      } else if (/\.nth\(\d+\)$/.test(baseSelector)) {
          const match = baseSelector.match(/(\.nth\(\d+\))$/);
          if (match) {
            suffixes.unshift(match[1]);
            baseSelector = baseSelector.slice(0, -match[1].length);
          } else {
            break;
          }
      } else {
          break;
      }
  }

  const baseJavaCode = convertBaseSelectorToJava(baseSelector);
  return baseJavaCode + suffixes.join('');
}

function convertBaseSelectorToJava(selector: string): string {
  // Handle getByRole
  const roleMatch = selector.match(/^getByRole\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (roleMatch) {
    const role = roleMatch[1].toUpperCase().replace(/-/g, '_'); 
    const optionsStr = roleMatch[2];
    
    let optionsCode = '';
    if (optionsStr) {
      optionsCode = ', new Page.GetByRoleOptions()';
      
      const nameMatch = optionsStr.match(/name:\s*'([^']+)'/);
      if (nameMatch) {
        optionsCode += `.setName("${escapeQuotes(nameMatch[1])}")`;
      }
      
      const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
      if (exactMatch) {
        optionsCode += `.setExact(${exactMatch[1]})`;
      }
    }
    
    return `page.getByRole(AriaRole.${role}${optionsCode})`;
  }
  
  // Handle getByText
  const textMatch = selector.match(/^getByText\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (textMatch) {
    const text = textMatch[1];
    const optionsStr = textMatch[2];
    let optionsCode = '';
    
    if (optionsStr) {
      optionsCode = ', new Page.GetByTextOptions()';
      const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
      if (exactMatch) {
        optionsCode += `.setExact(${exactMatch[1]})`;
      }
    }
    
    return `page.getByText("${escapeQuotes(text)}"${optionsCode})`;
  }
  
  // Handle getByLabel
  const labelMatch = selector.match(/^getByLabel\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (labelMatch) {
      const label = labelMatch[1];
      const optionsStr = labelMatch[2];
      let optionsCode = '';
      if (optionsStr) {
          optionsCode = ', new Page.GetByLabelOptions()';
          const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
          if (exactMatch) {
              optionsCode += `.setExact(${exactMatch[1]})`;
          }
      }
      return `page.getByLabel("${escapeQuotes(label)}"${optionsCode})`;
  }

  // Handle getByPlaceholder
  const placeholderMatch = selector.match(/^getByPlaceholder\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (placeholderMatch) {
      const text = placeholderMatch[1];
      const optionsStr = placeholderMatch[2];
      let optionsCode = '';
      if (optionsStr) {
          optionsCode = ', new Page.GetByPlaceholderOptions()';
          const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
          if (exactMatch) {
              optionsCode += `.setExact(${exactMatch[1]})`;
          }
      }
      return `page.getByPlaceholder("${escapeQuotes(text)}"${optionsCode})`;
  }

  // Handle getByAltText
  const altTextMatch = selector.match(/^getByAltText\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (altTextMatch) {
      const text = altTextMatch[1];
      const optionsStr = altTextMatch[2];
      let optionsCode = '';
      if (optionsStr) {
          optionsCode = ', new Page.GetByAltTextOptions()';
          const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
          if (exactMatch) {
              optionsCode += `.setExact(${exactMatch[1]})`;
          }
      }
      return `page.getByAltText("${escapeQuotes(text)}"${optionsCode})`;
  }
  
  // Handle getByTestId
  const testIdMatch = selector.match(/^getByTestId\('([^']+)'\)$/);
  if (testIdMatch) {
      return `page.getByTestId("${escapeQuotes(testIdMatch[1])}")`;
  }

  // Handle getByTitle
  const titleMatch = selector.match(/^getByTitle\('([^']+)'(?:,\s*\{(.*)\})?\)$/);
  if (titleMatch) {
      const title = titleMatch[1];
      const optionsStr = titleMatch[2];
      let optionsCode = '';
      if (optionsStr) {
          optionsCode = ', new Page.GetByTitleOptions()';
          const exactMatch = optionsStr.match(/exact:\s*(true|false)/);
          if (exactMatch) {
              optionsCode += `.setExact(${exactMatch[1]})`;
          }
      }
      return `page.getByTitle("${escapeQuotes(title)}"${optionsCode})`;
  }

  // Default fallback
  return `page.locator("${escapeQuotes(selector)}")`;
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}
