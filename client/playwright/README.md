# Playwright Tests

This directory contains end-to-end tests for the client application using Playwright.

## Structure

- `auth.spec.ts` - Tests for authentication flows (login, registration)
- `navigation.spec.ts` - Tests for navigation between pages
- `pages/` - Tests for specific pages
  - `dashboard.spec.ts` - Tests for the dashboard page
  - `holiday.spec.ts` - Tests for the holiday page
  - `profile.spec.ts` - Tests for the profile page
- `utils/` - Test utilities and helpers

## Running Tests

To run the tests:

```bash
npx playwright test
```

To run tests in UI mode:

```bash
npx playwright test --ui
```

To run a specific test file:

```bash
npx playwright test tests/auth.spec.ts
```
