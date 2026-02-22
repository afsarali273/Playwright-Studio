Feature: Generated Test

Scenario: Generated Test

Given web open browser

And web navigate to "https://example.com"

When web click element "[data-testid=\"login-button\"]"

When web type "testuser" into "[data-testid=\"username-input\"]"

When web type "password123" into "[data-testid=\"password-input\"]"

When web click element "[data-testid=\"submit-button\"]"
