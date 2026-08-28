import { test, expect } from "@playwright/test";

test("signup page renders", async ({ page }) => {
  await page.goto("/signup/new");
  await expect(page.getByRole("heading", { name: /signup/i }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[name="email"]')).toBeVisible();
});

test("login page renders", async ({ page }) => {
  await page.goto("/session/new");
  await expect(page.getByRole("heading", { name: /login/i }).first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[name="useremail"], input[name="email"]')).toBeVisible();
});
