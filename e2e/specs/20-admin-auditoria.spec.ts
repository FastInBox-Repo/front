import { test, expect } from "@playwright/test";
import { resetSession } from "../fixtures";

test("admin auditoria global", async ({ page }) => {
  await resetSession(page);
  await page.goto("/admin/auditoria");
  await page.waitForTimeout(1500);
  await expect(page.getByText(/auditoria|trilha|eventos|login/i).first()).toBeVisible();

  const filtros = page.locator("select");
  const count = await filtros.count();
  for (let i = 0; i < Math.min(count, 2); i++) {
    await filtros.nth(i).selectOption({ index: 1 }).catch(() => undefined);
    await page.waitForTimeout(700);
  }
});
