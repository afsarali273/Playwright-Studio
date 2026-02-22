# Playwright Studio

Welcome to the Playwright Studio! This project is designed to help developers automate web browsers using the Playwright library. Here's everything you need to know to get started with this project.

## Project Setup

To set up the project, follow these steps:

1. **Clone the repository:**  
   ```bash
   git clone https://github.com/afsarali273/Playwright-Studio.git
   ```

2. **Navigate to the project directory:**  
   ```bash
   cd Playwright-Studio
   ```

3. **Install dependencies:**  
   ```bash
   npm install
   ```

4. **Run the project:**  
   ```bash
   npm start
   ```

## Directory Breakdown

- **src/**: Contains the main source code for the application.
- **tests/**: Contains all the test files that ensure the code is functioning as expected.
- **config/**: Includes configuration files for various environments.
- **scripts/**: Contains useful scripts to automate tasks.

## Features

- **Cross-browser testing**: Supports multiple browsers, including Chromium, Firefox, and WebKit.
- **Headless mode**: Run tests without a GUI, allowing for faster execution.
- **Screenshots & Videos**: Capture screenshots and videos of tests for better debugging.
- **Customizable**: Easy to configure based on the requirements of the project.

## Examples

Here are some examples to help you get started:

### Basic Example
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });
  await browser.close();
})();
```

### Advanced Example with Assertions
```javascript
const { chromium } = require('playwright');
const { expect } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  const title = await page.title();
  expect(title).toBe('Example Domain');
  await browser.close();
})();
```

## Contributing Guidelines

We welcome contributions from everyone! If you'd like to contribute to the project, please follow these steps:

1. **Fork the repository**: Create your own copy of the repository on GitHub.
2. **Create a new branch**:  
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Make your changes**: Implement your feature or fix bugs.
4. **Submit a pull request**: Open a pull request in the original repository for review.

Thank you for your interest in contributing!