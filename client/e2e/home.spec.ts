import { test, expect } from "@playwright/test";

test("home loads and shows header", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/SparkNest/);
  await expect(page.locator("header, #page, .s-pagewrap").first()).toBeVisible({ timeout: 10000 });
});

test("navigation to login works", async ({ page }) => {
  await page.goto("/");
  const loginLink = page.getByRole("link", { name: /login|sign in/i }).first();
  if (await loginLink.isVisible()) {
    await loginLink.click();
    await expect(page).toHaveURL(/session\/new|login/);
  }
});
