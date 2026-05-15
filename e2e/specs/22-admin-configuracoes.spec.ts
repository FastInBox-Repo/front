import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("admin configuracoes globais", async ({ page }) => {
  await resetSession(page);
  await page.goto("/admin/configuracoes");
  await page.waitForTimeout(1500);
  await expect(page.getByText(/configura/i).first()).toBeVisible();

  const toggle = page.locator('input[type="checkbox"], button[role="switch"]').first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click().catch(() => undefined);
    await page.waitForTimeout(700);
  }
});
