# Recommended Playwright Locators

These are the recommended built-in locators, prioritized for better reliability and accessibility.

## Priority 1: Accessibility-based Locators (Preferred)

- **`page.getByRole()`**
  Locate by explicit and implicit accessibility attributes.
  ```javascript
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('listitem').filter({ hasText: 'Product 2' }).click();
  ```

- **`page.getByLabel()`**
  Locate a form control by associated label's text.
  ```javascript
  await page.getByLabel('Password').fill('secret');
  ```

- **`page.getByPlaceholder()`**
  Locate an input by placeholder.
  ```javascript
  await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
  ```

- **`page.getByAltText()`**
  Locate an element, usually image, by its text alternative.
  ```javascript
  await page.getByAltText('playwright logo').click();
  ```

- **`page.getByTitle()`**
  Locate an element by its title attribute.
  ```javascript
  await page.getByTitle('Issues count').click();
  ```

## Priority 2: Text Content

- **`page.getByText()`**
  Locate by text content.
  ```javascript
  await expect(page.getByText('Welcome, John', { exact: true })).toBeVisible();
  await expect(page.getByText(/welcome, [A-Za-z]+$/i)).toBeVisible();
  ```

## Priority 3: Test ID (Explicit Contract)

- **`page.getByTestId()`**
  Locate an element based on its `data-testid` attribute (configurable).
  ```javascript
  await page.getByTestId('settings-dialog').click();
  ```

## Priority 4: CSS / XPath (Fallback)

- **`page.locator()`**
  Use CSS or XPath when other locators are not applicable.
  ```javascript
  await page.locator('css=button').click();
  await page.locator('xpath=//button').click();
  await page.locator('button').click();
  ```

## Advanced Filtering & Chaining

```javascript
// Filter by text
await page
    .getByRole('listitem')
    .filter({ hasText: 'Product 2' })
    .getByRole('button', { name: 'Add to cart' })
    .click();

// Filter by child element
await page
    .getByRole('listitem')
    .filter({ has: page.getByRole('heading', { name: 'Product 2' }) })
    .getByRole('button', { name: 'Add to cart' })
    .click();

// Chaining
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
```
