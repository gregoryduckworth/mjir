import { test } from "../fixtures/PageFixtures";
import { expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.login("admin", "password");
  });

  test("should navigate to Dashboard page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });

  test("should navigate to Holiday page", async ({ page }) => {
    await page.goto("/holiday");
    await expect(
      page.getByRole("heading", { name: "Holiday Management" })
    ).toBeVisible();
  });

  test("should navigate to Policies page", async ({ page }) => {
    await page.goto("/policies");
    await expect(
      page.getByRole("heading", { name: "Company Policies" })
    ).toBeVisible();
  });

  test("should navigate to Learning page", async ({ page }) => {
    await page.goto("/learning");
    await expect(
      page.getByRole("heading", { name: "Learning & Development" })
    ).toBeVisible();
  });

  test("should navigate to Organization page", async ({ page }) => {
    await page.goto("/organization");
    await expect(
      page.getByRole("heading", { name: "Organization Structure" })
    ).toBeVisible();
  });

  test("should navigate to Profile page", async ({ page }) => {
    await page.getByTestId("view-profile").click();
    await expect(
      page.getByRole("heading", { name: "Employee Profile" })
    ).toBeVisible();
  });
});
