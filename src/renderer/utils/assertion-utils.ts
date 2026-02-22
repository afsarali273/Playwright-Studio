import { InspectorPayload } from '../../shared/types';

export type AssertionCategory = 'page' | 'element' | 'text' | 'form';

export interface AssertionOption {
  label: string;
  type: string; // The assertion key sent to backend
  category: AssertionCategory;
  requiresValue?: boolean;
  defaultValue?: string;
}

export function getApplicableAssertions(payload: InspectorPayload | null): AssertionOption[] {
    const options: AssertionOption[] = [];
    
    if (!payload) return [];

    const { tagName, attributes, innerText, value } = payload;
    const tag = tagName ? tagName.toLowerCase() : '';
    const inputType = attributes ? attributes['type'] : '';
    
    // 1. Visibility (All)
    options.push({ label: 'Is Visible', type: 'toBeVisible', category: 'element' });
    options.push({ label: 'Is Hidden', type: 'toBeHidden', category: 'element' });
    options.push({ label: 'Exists', type: 'toExist', category: 'element' });
    
    // 2. Text (If text present)
    if (innerText && innerText.trim().length > 0) {
        options.push({ label: 'Has Text', type: 'toHaveText', category: 'text', requiresValue: true, defaultValue: innerText.trim() });
        options.push({ label: 'Contains Text', type: 'toContainText', category: 'text', requiresValue: true, defaultValue: innerText.trim() });
    }
    
    // 3. Form Elements
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        options.push({ label: 'Has Value', type: 'toHaveValue', category: 'form', requiresValue: true, defaultValue: value || '' });
        options.push({ label: 'Is Enabled', type: 'toBeEnabled', category: 'form' });
        options.push({ label: 'Is Disabled', type: 'toBeDisabled', category: 'form' });
        options.push({ label: 'Is Empty', type: 'toBeEmpty', category: 'form' });
        
        if (inputType === 'checkbox' || inputType === 'radio') {
            options.push({ label: 'Is Checked', type: 'toBeChecked', category: 'form' });
            options.push({ label: 'Is Unchecked', type: 'toBeUnchecked', category: 'form' });
        }
    }
    
    // 4. Links
    if (tag === 'a' && attributes && attributes['href']) {
        options.push({ label: 'Has Href', type: 'toHaveAttribute', category: 'element', requiresValue: true, defaultValue: attributes['href'] });
    }
    
    // 5. Attributes (Generic)
    options.push({ label: 'Has Attribute', type: 'toHaveAttribute', category: 'element', requiresValue: true });
    options.push({ label: 'Has Class', type: 'toHaveClass', category: 'element', requiresValue: true, defaultValue: attributes ? attributes['class'] : '' });
    options.push({ label: 'Count', type: 'toHaveCount', category: 'element', requiresValue: true, defaultValue: '1' });

    return options;
}
