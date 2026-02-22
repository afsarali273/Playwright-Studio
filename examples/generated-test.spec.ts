/**
 * Example generated test output from the Script Generator.
 * This is what the export feature produces from recorded steps.
 */

import { test, expect } from '@playwright/test';

test('generated test', async ({ page }) => {
  // Step 1: Navigate to page
  await page.goto('https://example.com');

  // Step 2: Click on login button
  await page.click('[data-testid="login-button"]');

  // Step 3: Type username
  await page.fill('[data-testid="username-input"]', 'testuser');

  // Step 4: Type password
  await page.fill('[data-testid="password-input"]', 'password123');

  // Step 5: Click submit
  await page.click('[data-testid="submit-button"]');

  // Step 6: Wait for navigation
  await page.waitForURL('**/dashboard');
});
